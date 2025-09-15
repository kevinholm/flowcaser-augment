'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createSupabaseClient } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout'
import Link from 'next/link'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  LightBulbIcon,
  CalendarIcon,
  UserIcon,
  HandThumbUpIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

interface FeatureRequest {
  id: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'in_development' | 'completed' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  votes: number
  team_id: string
  created_by: string
  created_at: string
  updated_at: string
  creator?: {
    full_name: string | null
    email: string
  }
}

const statusLabels = {
  pending: 'Afventer',
  approved: 'Godkendt',
  in_development: 'Under udvikling',
  completed: 'Færdig',
  rejected: 'Afvist',
}

const priorityLabels = {
  low: 'Lav',
  medium: 'Medium',
  high: 'Høj',
}

export default function FeaturesPage() {
  const { profile } = useAuth()
  const [features, setFeatures] = useState<FeatureRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchFeatures = async () => {
      if (!profile?.team_id) return

      try {
        const { data, error } = await supabase
          .from('feature_requests')
          .select(`
            *,
            creator:users!feature_requests_created_by_fkey(full_name, email)
          `)
          .eq('team_id', profile.team_id)
          .order('votes', { ascending: false })

        if (error) throw error

        setFeatures(data || [])
      } catch (error) {
        console.error('Error fetching feature requests:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeatures()
  }, [profile?.team_id, supabase])

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !selectedStatus || feature.status === selectedStatus
    const matchesPriority = !selectedPriority || feature.priority === selectedPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending'
      case 'approved': return 'status-approved'
      case 'in_development': return 'status-in-development'
      case 'completed': return 'status-completed'
      case 'rejected': return 'status-rejected'
      default: return 'badge-gray'
    }
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'low': return 'priority-low'
      case 'medium': return 'priority-medium'
      case 'high': return 'priority-high'
      default: return 'badge-gray'
    }
  }

  const handleVote = async (featureId: string) => {
    try {
      const { data, error } = await supabase
        .from('feature_requests')
        .update({ votes: features.find(f => f.id === featureId)!.votes + 1 })
        .eq('id', featureId)
        .select()
        .single()

      if (error) throw error

      setFeatures(prev => prev.map(f => 
        f.id === featureId ? { ...f, votes: data.votes } : f
      ))
    } catch (error) {
      console.error('Error voting:', error)
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Feature Requests</h1>
            <p className="mt-1 text-sm text-gray-500">
              Foreslå og stem på nye funktioner og forbedringer
            </p>
          </div>
          <Link
            href="/features/new"
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Foreslå Feature
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="card-body flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Søg i feature requests..."
                  className="form-input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="form-input"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Alle status</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:w-40">
              <select
                className="form-input"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option value="">Alle prioriteter</option>
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Features List */}
        {filteredFeatures.length === 0 ? (
          <div className="card text-center py-12">
            <LightBulbIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen feature requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedStatus || selectedPriority
                ? 'Ingen features matcher dine søgekriterier.'
                : 'Ingen feature requests endnu. Vær den første til at foreslå en forbedring!'
              }
            </p>
            {!searchTerm && !selectedStatus && !selectedPriority && (
              <div className="mt-6">
                <Link href="/features/new" className="btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Foreslå Feature
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFeatures.map((feature) => (
              <div key={feature.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/features/${feature.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-primary-600"
                      >
                        {feature.title}
                      </Link>
                      <span className={`badge ${getStatusBadgeClass(feature.status)}`}>
                        {statusLabels[feature.status]}
                      </span>
                      <span className={`badge ${getPriorityBadgeClass(feature.priority)}`}>
                        {priorityLabels[feature.priority]}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {feature.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {feature.creator?.full_name || feature.creator?.email}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {format(new Date(feature.created_at), 'dd MMM yyyy', { locale: da })}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center ml-4">
                    <button
                      onClick={() => handleVote(feature.id)}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <HandThumbUpIcon className="h-5 w-5 text-gray-400 hover:text-primary-500" />
                      <span className="text-sm font-medium text-gray-600 mt-1">
                        {feature.votes}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
