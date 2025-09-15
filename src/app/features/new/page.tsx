'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createSupabaseClient } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout'
import toast from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function NewFeaturePage() {
  const { user, profile } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !profile?.team_id) {
      toast.error('Du skal være logget ind for at foreslå en feature')
      return
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Udfyld venligst alle påkrævede felter')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('feature_requests')
        .insert({
          title: title.trim(),
          description: description.trim(),
          priority,
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
          title: 'Ny feature request',
          message: `${profile.full_name || user.email} har foreslået en ny feature: ${title}`,
          type: 'info',
          team_id: profile.team_id,
          user_id: user.id,
        })

      toast.success('Feature request oprettet!')
      router.push(`/features/${data.id}`)
    } catch (error: any) {
      console.error('Error creating feature request:', error)
      toast.error(error.message || 'Der opstod en fejl ved oprettelse af feature request')
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
              href="/features"
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Tilbage til Features
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Foreslå Ny Feature</h1>
          <p className="mt-1 text-sm text-gray-500">
            Beskriv den nye funktionalitet eller forbedring du ønsker
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
                  placeholder="Kort beskrivelse af featuren..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Prioritet *
                </label>
                <select
                  id="priority"
                  className="mt-1 select-field"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  required
                >
                  <option value="low">Lav - Nice to have</option>
                  <option value="medium">Medium - Ønskelig</option>
                  <option value="high">Høj - Vigtig</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Beskrivelse *
                </label>
                <textarea
                  id="description"
                  rows={8}
                  className="mt-1 textarea-field"
                  placeholder="Beskriv featuren detaljeret:
- Hvad skal funktionen kunne?
- Hvorfor er den vigtig?
- Hvordan forestiller du dig den skal fungere?
- Hvilke problemer løser den?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/features"
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
              Foreslå Feature
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
