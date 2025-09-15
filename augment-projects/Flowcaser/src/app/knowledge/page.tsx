'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createSupabaseClient } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout'
import Link from 'next/link'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  ChevronRightIcon,
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

export default function KnowledgePage() {
  const { profile } = useAuth()
  const [cases, setCases] = useState<KnowledgeCase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchKnowledgeCases = async () => {
      if (!profile?.team_id) return

      try {
        const { data, error } = await supabase
          .from('knowledge_cases')
          .select(`
            *,
            creator:users!knowledge_cases_created_by_fkey(full_name, email)
          `)
          .eq('team_id', profile.team_id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setCases(data || [])

        // Extract unique categories
        const uniqueCategories = [...new Set(data?.map(case_ => case_.category) || [])]
        setCategories(uniqueCategories)
      } catch (error) {
        console.error('Error fetching knowledge cases:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchKnowledgeCases()
  }, [profile?.team_id, supabase])

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = !selectedCategory || case_.category === selectedCategory


    return matchesSearch && matchesCategory
  })

  const sortedCases = [...filteredCases].sort((a, b) => {
    const da = new Date(a.created_at).getTime()
    const db = new Date(b.created_at).getTime()
    return sortOrder === 'newest' ? db - da : da - db
  })

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Videns Base</h1>
            <p className="mt-1 text-sm text-gray-500">
              Del og organiser teamets viden og erfaringer
            </p>
          </div>
          <Link
            href="/knowledge/new"
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Ny Videns Case
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="card-body flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Søg i videns cases..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <select
                className="form-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Alle kategorier</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                className="form-input"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              >
                <option value="newest">Nyeste først</option>
                <option value="oldest">Ældste først</option>
              </select>
            </div>
          </div>
        </div>

        {/* Knowledge Cases List */}
        {sortedCases.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen videns cases</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory
                ? 'Ingen cases matcher dine søgekriterier.'
                : 'Kom i gang ved at oprette din første videns case.'
              }
            </p>
            {!searchTerm && !selectedCategory && (
              <div className="mt-6">
                <Link href="/knowledge/new" className="btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Opret Videns Case
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {sortedCases.map((case_) => (
              <Link
                key={case_.id}
                href={`/knowledge/${case_.id}`}
                className="card hover:shadow-md transition-shadow group"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                        {case_.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                        {case_.content.replace(/\n/g, ' ').slice(0, 140)}{case_.content.length > 140 ? '…' : ''}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="inline-flex items-center">
                          <TagIcon className="h-4 w-4 mr-1" />{case_.category}
                        </span>
                        <span className="inline-flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {case_.creator?.full_name || case_.creator?.email}
                        </span>
                        <span className="inline-flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {format(new Date(case_.created_at), 'dd MMM yyyy', { locale: da })}
                        </span>
                        {case_.tags?.slice(0, 3).map((tag, i) => (
                          <span key={i} className="badge badge-gray">{tag}</span>
                        ))}
                        {case_.tags?.length > 3 && (
                          <span className="badge badge-gray">+{case_.tags.length - 3} mere</span>
                        )}
                      </div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
