'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { createSupabaseClient } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout'
import Link from 'next/link'
import toast from 'react-hot-toast'
import ReactMarkdown from 'react-markdown'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

interface KnowledgeCase {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  team_id: string
  created_by: string
  created_at: string
  updated_at: string
  creator?: {
    full_name: string | null
    email: string
  }
}

export default function KnowledgeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const [knowledgeCase, setKnowledgeCase] = useState<KnowledgeCase | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchKnowledgeCase = async () => {
      if (!params.id || !profile?.team_id) return

      try {
        const { data, error } = await supabase
          .from('knowledge_cases')
          .select(`
            *,
            creator:users!knowledge_cases_created_by_fkey(full_name, email)
          `)
          .eq('id', params.id)
          .eq('team_id', profile.team_id)
          .single()

        if (error) throw error

        setKnowledgeCase(data)
      } catch (error) {
        console.error('Error fetching knowledge case:', error)
        toast.error('Kunne ikke indlæse videns case')
        router.push('/knowledge')
      } finally {
        setLoading(false)
      }
    }

    fetchKnowledgeCase()
  }, [params.id, profile?.team_id, supabase, router])

  const handleDelete = async () => {
    if (!knowledgeCase || !user) return

    if (!confirm('Er du sikker på, at du vil slette denne videns case? Dette kan ikke fortrydes.')) {
      return
    }

    setDeleting(true)

    try {
      const { error } = await supabase
        .from('knowledge_cases')
        .delete()
        .eq('id', knowledgeCase.id)

      if (error) throw error

      toast.success('Videns case slettet')
      router.push('/knowledge')
    } catch (error: any) {
      console.error('Error deleting knowledge case:', error)
      toast.error(error.message || 'Der opstod en fejl ved sletning')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </AppLayout>
    )
  }

  if (!knowledgeCase) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Videns case ikke fundet</h2>
          <p className="mt-2 text-gray-600">Den ønskede videns case eksisterer ikke eller er blevet slettet.</p>
          <Link href="/knowledge" className="mt-4 btn-primary inline-flex items-center">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Tilbage til Videns Base
          </Link>
        </div>
      </AppLayout>
    )
  }

  const canEdit = user?.id === knowledgeCase.created_by || profile?.role === 'admin'

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/knowledge"
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Tilbage til Videns Base
          </Link>

          {canEdit && (
            <div className="flex space-x-2">
              <Link
                href={`/knowledge/${knowledgeCase.id}/edit`}
                className="btn-secondary flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Rediger
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="btn-danger flex items-center"
              >
                {deleting ? (
                  <div className="spinner mr-1"></div>
                ) : (
                  <TrashIcon className="h-4 w-4 mr-1" />
                )}
                Slet
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="card">
          <div className="space-y-6">
            {/* Title and Meta */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {knowledgeCase.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <TagIcon className="h-4 w-4 mr-1" />
                  {knowledgeCase.category}
                </div>
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  {knowledgeCase.creator?.full_name || knowledgeCase.creator?.email}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Oprettet {format(new Date(knowledgeCase.created_at), 'dd MMM yyyy', { locale: da })}
                </div>
                {knowledgeCase.updated_at !== knowledgeCase.created_at && (
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Opdateret {format(new Date(knowledgeCase.updated_at), 'dd MMM yyyy', { locale: da })}
                  </div>
                )}
              </div>

              {knowledgeCase.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {knowledgeCase.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="badge badge-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-blue max-w-none">
              <ReactMarkdown>{knowledgeCase.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
