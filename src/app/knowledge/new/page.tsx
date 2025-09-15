'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createSupabaseClient } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout'
import toast from 'react-hot-toast'
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function NewKnowledgePage() {
  const { user, profile } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !profile?.team_id) {
      toast.error('Du skal være logget ind for at oprette en videns case')
      return
    }

    if (!title.trim() || !content.trim() || !category.trim()) {
      toast.error('Udfyld venligst alle påkrævede felter')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('knowledge_cases')
        .insert({
          title: title.trim(),
          content: content.trim(),
          category: category.trim(),
          tags,
          team_id: profile.team_id,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error

      // Create notification for team members
      await supabase
        .from('notifications')
        .insert({
          title: 'Ny videns case',
          message: `${profile.full_name || user.email} har oprettet en ny videns case: ${title}`,
          type: 'info',
          team_id: profile.team_id,
          user_id: user.id,
        })

      toast.success('Videns case oprettet!')
      router.push(`/knowledge/${data.id}`)
    } catch (error: any) {
      console.error('Error creating knowledge case:', error)
      toast.error(error.message || 'Der opstod en fejl ved oprettelse af videns case')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/knowledge"
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Tilbage til Videns Base
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Opret Ny Videns Case</h1>
          <p className="mt-1 text-sm text-gray-500">
            Del din viden og erfaring med teamet
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titel *
                </label>
                <input
                  type="text"
                  id="title"
                  className="mt-1 input-field"
                  placeholder="Skriv en beskrivende titel..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Kategori *
                </label>
                <input
                  type="text"
                  id="category"
                  className="mt-1 input-field"
                  placeholder="f.eks. Udvikling, Design, Proces..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 input-field"
                    placeholder="Tilføj tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn-secondary flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Tilføj
                  </button>
                </div>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Indhold *
                </label>
                <textarea
                  id="content"
                  rows={12}
                  className="mt-1 textarea-field"
                  placeholder="Skriv din videns case her... Du kan bruge Markdown formatering."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Tip: Du kan bruge Markdown formatering som **fed tekst**, *kursiv*, `kode`, og lister.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/knowledge"
              className="btn-secondary"
            >
              Annuller
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="spinner mr-2"></div>
              ) : null}
              Opret Videns Case
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
