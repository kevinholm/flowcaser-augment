'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { uploadFile, FileUpload } from '@/lib/storage'
import toast from 'react-hot-toast'
import {
  CloudArrowUpIcon,
  DocumentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

interface FileUploadProps {
  entityType: 'bug' | 'feature_request' | 'knowledge_case' | 'chat_message'
  entityId: string
  onUploadComplete?: (attachment: any) => void
  maxFiles?: number
  maxSizeBytes?: number
  acceptedTypes?: string[]
}

export default function FileUpload({
  entityType,
  entityId,
  onUploadComplete,
  maxFiles = 5,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
}: FileUploadProps) {
  const { user, profile } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    if (!user || !profile?.team_id) {
      toast.error('Du skal være logget ind for at uploade filer')
      return
    }

    const fileArray = Array.from(files)

    // Validate file count
    if (fileArray.length > maxFiles) {
      toast.error(`Du kan maksimalt uploade ${maxFiles} filer ad gangen`)
      return
    }

    // Validate file sizes
    const oversizedFiles = fileArray.filter(file => file.size > maxSizeBytes)
    if (oversizedFiles.length > 0) {
      toast.error(`Nogle filer er for store. Maksimal størrelse er ${Math.round(maxSizeBytes / 1024 / 1024)}MB`)
      return
    }

    setUploading(true)

    try {
      const uploadPromises = fileArray.map(file => 
        uploadFile({
          file,
          entityType,
          entityId,
          teamId: profile.team_id,
          uploadedBy: user.id,
        })
      )

      const results = await Promise.all(uploadPromises)
      
      results.forEach(attachment => {
        if (onUploadComplete) {
          onUploadComplete(attachment)
        }
      })

      toast.success(`${results.length} fil(er) uploadet`)
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Upload fejlede')
    } finally {
      setUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="spinner mb-2"></div>
              <p className="text-sm text-gray-600">Uploader filer...</p>
            </div>
          ) : (
            <>
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="text-primary-600 hover:text-primary-500 font-medium"
                >
                  Klik for at uploade
                </button>
                <span className="text-gray-500"> eller træk filer hertil</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Maksimalt {maxFiles} filer, {Math.round(maxSizeBytes / 1024 / 1024)}MB hver
              </p>
              <p className="text-xs text-gray-400">
                Understøttede formater: billeder, PDF, Word dokumenter, tekst
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
