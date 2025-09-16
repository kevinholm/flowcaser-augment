import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import {
  getFileAttachments,
  deleteFile,
  formatFileSize,
  getFileIcon,
  isImageFile,
  type FileAttachment
} from '../../lib/storage'
import toast from 'react-hot-toast'
import {
  TrashIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'

interface FileAttachmentsProps {
  entityType: 'bug' | 'feature_request' | 'knowledge_case' | 'chat_message'
  entityId: string
  refreshTrigger?: number
}

export default function FileAttachments({
  entityType,
  entityId,
  refreshTrigger = 0,
}: FileAttachmentsProps) {
  const { user } = useAuthStore()
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const data = await getFileAttachments(entityType, entityId)
        setAttachments(data)
      } catch (error) {
        console.error('Error fetching attachments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAttachments()
  }, [entityType, entityId, refreshTrigger])

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Er du sikker på, at du vil slette denne fil?')) {
      return
    }

    setDeleting(attachmentId)
    try {
      await deleteFile(attachmentId)
      setAttachments(prev => prev.filter(a => a.id !== attachmentId))
      toast.success('Fil slettet')
    } catch (error: any) {
      console.error('Delete error:', error)
      toast.error(error.message || 'Kunne ikke slette fil')
    } finally {
      setDeleting(null)
    }
  }

  const handleDownload = (attachment: FileAttachment) => {
    if (attachment.public_url) {
      const link = document.createElement('a')
      link.href = attachment.public_url
      link.download = attachment.filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePreview = (attachment: FileAttachment) => {
    if (attachment.public_url) {
      window.open(attachment.public_url, '_blank')
    }
  }

  const canDelete = (attachment: FileAttachment) => {
    return user?.id === attachment.uploaded_by || profile?.role === 'admin'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="spinner"></div>
      </div>
    )
  }

  if (attachments.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-900">
        Vedhæftede filer ({attachments.length})
      </h4>
      
      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <span className="text-2xl flex-shrink-0">
                {getFileIcon(attachment.mime_type)}
              </span>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.filename}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(attachment.file_size)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {/* Preview button for images */}
              {isImageFile(attachment.mime_type) && (
                <button
                  onClick={() => handlePreview(attachment)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Forhåndsvis"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              )}

              {/* Download button */}
              <button
                onClick={() => handleDownload(attachment)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Download"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>

              {/* Delete button */}
              {canDelete(attachment) && (
                <button
                  onClick={() => handleDelete(attachment.id)}
                  disabled={deleting === attachment.id}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Slet"
                >
                  {deleting === attachment.id ? (
                    <div className="w-4 h-4">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <TrashIcon className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
