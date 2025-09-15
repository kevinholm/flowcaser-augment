import { useState, useEffect } from 'react'
import { LightBulbIcon, PlusIcon, MagnifyingGlassIcon, HandThumbUpIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

interface Feature {
  id: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'in_development' | 'completed' | 'rejected'
  votes: number
  created_at: string
  updated_at: string
}

export default function Features() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      fetchFeatures()
    }
  }, [user])

  const fetchFeatures = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('feature_requests')
        .select('*')
        .order('votes', { ascending: false })

      if (error) {
        throw error
      }

      setFeatures(data || [])
    } catch (error: any) {
      console.error('Error fetching features:', error)
      toast.error('Kunne ikke hente features')
    } finally {
      setLoading(false)
    }
  }

  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || feature.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      in_development: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      pending: 'Afventer',
      approved: 'Godkendt',
      in_development: 'Under udvikling',
      completed: 'Færdig',
      rejected: 'Afvist'
    }

    return (
      <span className={`badge ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const handleVote = (featureId: string) => {
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, votes: feature.votes + 1 }
        : feature
    ))
    toast.success('Stemme afgivet!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <LightBulbIcon className="h-8 w-8 text-yellow-500 mr-3" />
            Feature Ønsker
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Foreslå og stem på nye funktioner
          </p>
        </div>
        <button
          onClick={() => toast.success('Foreslå feature funktionalitet kommer snart!')}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Foreslå Feature
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="form-label">Søg</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Søg i features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">Alle status</option>
                <option value="pending">Afventer</option>
                <option value="approved">Godkendt</option>
                <option value="in_development">Under udvikling</option>
                <option value="completed">Færdig</option>
                <option value="rejected">Afvist</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
                className="btn-secondary w-full"
              >
                Ryd filtre
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredFeatures.length === 0 ? (
          <div className="text-center py-12">
            <LightBulbIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen features fundet</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Prøv at justere dine filtre'
                : 'Foreslå din første feature for at komme i gang'
              }
            </p>
          </div>
        ) : (
          filteredFeatures.map((feature) => (
            <div key={feature.id} className="card card-hover">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {feature.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(feature.status)}
                        <button
                          onClick={() => handleVote(feature.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          <HandThumbUpIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{feature.votes}</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Foreslået {new Date(feature.created_at).toLocaleDateString('da-DK')}
                      </span>
                      <button
                        onClick={() => toast.success('Åbner feature detaljer')}
                        className="text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Se detaljer →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
