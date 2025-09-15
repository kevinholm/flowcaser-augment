'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createSupabaseClient } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout'
import toast from 'react-hot-toast'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { format } from 'date-fns'

export default function NewTimeLogPage() {
  const { user, profile } = useAuth()
  const [description, setDescription] = useState('')
  const [hours, setHours] = useState('')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [project, setProject] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !profile?.team_id) {
      toast.error('Du skal være logget ind for at registrere tid')
      return
    }

    if (!description.trim() || !hours || parseFloat(hours) <= 0) {
      toast.error('Udfyld venligst alle påkrævede felter korrekt')
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('time_logs')
        .insert({
          description: description.trim(),
          hours: parseFloat(hours),
          date,
          project: project.trim() || null,
          team_id: profile.team_id,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Tid registreret!')
      router.push('/time')
    } catch (error: any) {
      console.error('Error creating time log:', error)
      toast.error(error.message || 'Der opstod en fejl ved registrering af tid')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/time"
              className="flex items-center text-gray-500 hover:text-gray-700"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              Tilbage til Tidsregistrering
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Registrer Tid</h1>
          <p className="mt-1 text-sm text-gray-500">
            Log den tid du har brugt på opgaver og projekter
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Beskrivelse *
                </label>
                <input
                  type="text"
                  id="description"
                  className="mt-1 input-field"
                  placeholder="Hvad arbejdede du på?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              {/* Hours */}
              <div>
                <label htmlFor="hours" className="block text-sm font-medium text-gray-700">
                  Timer *
                </label>
                <input
                  type="number"
                  id="hours"
                  step="0.25"
                  min="0.25"
                  max="24"
                  className="mt-1 input-field"
                  placeholder="f.eks. 2.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Angiv timer i decimaler (f.eks. 1.5 for 1 time og 30 minutter)
                </p>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Dato *
                </label>
                <input
                  type="date"
                  id="date"
                  className="mt-1 input-field"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              {/* Project */}
              <div>
                <label htmlFor="project" className="block text-sm font-medium text-gray-700">
                  Projekt
                </label>
                <input
                  type="text"
                  id="project"
                  className="mt-1 input-field"
                  placeholder="Valgfrit projektnavn"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Link
              href="/time"
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
              Registrer Tid
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}
