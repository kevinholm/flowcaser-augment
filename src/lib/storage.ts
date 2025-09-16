import { createSupabaseClient } from './supabase'
import type { FileAttachment, FileAttachmentInsert } from './database.types'

export interface FileUpload {
  file: File
  entityType: 'bug' | 'feature_request' | 'knowledge_case' | 'chat_message'
  entityId: string
  teamId: string
  uploadedBy: string
}

// Re-export FileAttachment type from database types
export type { FileAttachment }

export const uploadFile = async (upload: FileUpload): Promise<FileAttachment> => {
  const supabase = createSupabaseClient()
  
  // Generate unique filename
  const fileExt = upload.file.name.split('.').pop()
  const fileName = `${upload.entityType}/${upload.entityId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  
  // Upload file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(fileName, upload.file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('attachments')
    .getPublicUrl(fileName)

  // Save file metadata to database
  const { data: attachmentData, error: dbError } = await supabase
    .from('file_attachments')
    .insert({
      filename: upload.file.name,
      file_path: uploadData.path,
      file_size: upload.file.size,
      mime_type: upload.file.type,
      entity_type: upload.entityType,
      entity_id: upload.entityId,
      team_id: upload.teamId,
      uploaded_by: upload.uploadedBy,
    })
    .select()
    .single()

  if (dbError) {
    // Clean up uploaded file if database insert fails
    await supabase.storage.from('attachments').remove([fileName])
    throw new Error(`Database error: ${dbError.message}`)
  }

  return {
    ...attachmentData,
    public_url: publicUrl,
  }
}

export const getFileAttachments = async (
  entityType: string,
  entityId: string
): Promise<FileAttachment[]> => {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('file_attachments')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch attachments: ${error.message}`)
  }

  // Add public URLs
  return data.map(attachment => {
    const { data: { publicUrl } } = supabase.storage
      .from('attachments')
      .getPublicUrl(attachment.file_path)
    
    return {
      ...attachment,
      public_url: publicUrl,
    }
  })
}

export const deleteFile = async (attachmentId: string): Promise<void> => {
  const supabase = createSupabaseClient()
  
  // Get file info
  const { data: attachment, error: fetchError } = await supabase
    .from('file_attachments')
    .select('file_path')
    .eq('id', attachmentId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch attachment: ${fetchError.message}`)
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('attachments')
    .remove([attachment.file_path])

  if (storageError) {
    console.error('Storage deletion error:', storageError)
    // Continue with database deletion even if storage fails
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('file_attachments')
    .delete()
    .eq('id', attachmentId)

  if (dbError) {
    throw new Error(`Database deletion error: ${dbError.message}`)
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/')
}

export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return '🖼️'
  if (mimeType.startsWith('video/')) return '🎥'
  if (mimeType.startsWith('audio/')) return '🎵'
  if (mimeType.includes('pdf')) return '📄'
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📈'
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return '📦'
  return '📎'
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
