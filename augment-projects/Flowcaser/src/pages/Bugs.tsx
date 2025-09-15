import { useState, useEffect } from 'react'
import { PlusIcon, MagnifyingGlassIcon, BugAntIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

interface Bug {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_to?: string
  created_at: string
  updated_at: string
}

export default function Bugs() {
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      fetchBugs()
    }
  }, [user])

  const fetchBugs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('bugs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setBugs(data || [])
    } catch (error: any) {
      console.error('Error fetching bugs:', error)
      toast.error('Kunne ikke hente bugs')
    } finally {
      setLoading(false)
    }
  }

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bug.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || bug.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || bug.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      open: 'Åben',
      in_progress: 'I gang',
      resolved: 'Løst',
      closed: 'Lukket'
    }

    return (
      <span className={`badge ${styles[status as keyof typeof styles] || styles.open}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      low: 'Lav',
      medium: 'Medium',
      high: 'Høj',
      critical: 'Kritisk'
    }

    return (
      <span className={`badge ${styles[priority as keyof typeof styles] || styles.medium}`}>
        {labels[priority as keyof typeof labels] || priority}
      </span>
    )
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
            <BugAntIcon className="h-8 w-8 text-red-500 mr-3" />
            Bug Tracking
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Administrer og spor bugs i dit projekt
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Rapporter Bug
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="form-label">Søg</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Søg i bugs..."
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
                <option value="open">Åben</option>
                <option value="in_progress">I gang</option>
                <option value="resolved">Løst</option>
                <option value="closed">Lukket</option>
              </select>
            </div>
            <div>
              <label className="form-label">Prioritet</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">Alle prioriteter</option>
                <option value="critical">Kritisk</option>
                <option value="high">Høj</option>
                <option value="medium">Medium</option>
                <option value="low">Lav</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setPriorityFilter('all')
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
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Bugs ({filteredBugs.length})
          </h3>
        </div>
        <div className="card-body p-0">
          {filteredBugs.length === 0 ? (
            <div className="text-center py-12">
              <BugAntIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen bugs fundet</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Prøv at justere dine filtre'
                  : 'Rapporter din første bug for at komme i gang'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Rapporter Bug
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Titel</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Prioritet</th>
                    <th className="table-header">Oprettet</th>
                    <th className="table-header">Handlinger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBugs.map((bug) => (
                    <tr key={bug.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {bug.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {bug.description}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        {getStatusBadge(bug.status)}
                      </td>
                      <td className="table-cell">
                        {getPriorityBadge(bug.priority)}
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {new Date(bug.created_at).toLocaleDateString('da-DK')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(bug.created_at).toLocaleTimeString('da-DK', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => toast.success('Bug detaljer åbnet')}
                          className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                          Se detaljer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Bug Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rapporter Bug</h3>
            <p className="text-gray-500 mb-4">
              Bug rapportering funktionalitet kommer snart!
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Luk
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  toast.success('Bug rapporteret!')
                }}
                className="btn-primary"
              >
                Rapporter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
