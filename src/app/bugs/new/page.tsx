'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createSupabaseClient } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout'
import toast from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface TeamMember {
  id: string
  full_name: string | null
  email: string
}

export default function NewBugPage() {
  const { user, profile } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [assignedTo, setAssignedTo] = useState('')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!profile?.team_id) return

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, email')
          .eq('team_id', profile.team_id)
          .order('full_name', { ascending: true })

        if (error) throw error

        setTeamMembers(data || [])
      } catch (error) {
        console.error('Error fetching team members:', error)
      }
    }

    fetchTeamMembers()
  }, [profile?.team_id, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !profile?.team_id) {
      toast.error('Du skal være logget ind for at rapportere en bug')
      return
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Udfyld venligst alle påkrævede felter')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('bugs')
        .insert({
          title: title.trim(),
          description: description.trim(),
          priority,
          assigned_to: assignedTo || null,
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
          title: 'Ny bug rapporteret',
          message: `${profile.full_name || user.email} har rapporteret en ny bug: ${title}`,
          type: 'warning',
          team_id: profile.team_id,
          user_id: user.id,
        })

      // If assigned to someone, create specific notification
      if (assignedTo) {
        await supabase
          .from('notifications')
          .insert({
            title: 'Bug tildelt til dig',
            message: `Du er blevet tildelt en ny bug: ${title}`,
            type: 'info',
            team_id: profile.team_id,
            user_id: assignedTo,
          })
      }

      toast.success('Bug rapporteret!')
      router.push(`/bugs/${data.id}`)
    } catch (error: any) {
      console.error('Error creating bug:', error)
      toast.error(error.message || 'Der opstod en fejl ved rapportering af bug')
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
              href="/bugs"
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Tilbage til Bugs
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapporter Ny Bug</h1>
          <p className="mt-1 text-sm text-gray-500">
            Beskriv fejlen så detaljeret som muligt
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
                  placeholder="Kort beskrivelse af fejlen..."
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
                  <option value="low">Lav</option>
                  <option value="medium">Medium</option>
                  <option value="high">Høj</option>
                  <option value="critical">Kritisk</option>
                </select>
              </div>

              {/* Assigned To */}
              <div>
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
                  Tildel til
                </label>
                <select
                  id="assignedTo"
                  className="mt-1 select-field"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">Vælg team medlem (valgfrit)</option>
                  {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name || member.email}
                    </option>
                  ))}
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
                  placeholder="Beskriv fejlen detaljeret:
- Hvad skete der?
- Hvad forventede du skulle ske?
- Hvordan kan fejlen reproduceres?
- Hvilken browser/enhed brugte du?"
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
              href="/bugs"
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
              Rapporter Bug
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
