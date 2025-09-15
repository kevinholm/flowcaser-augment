import { useState, useEffect } from 'react'
import { BookOpenIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

interface KnowledgeCase {
  id: string
  title: string
  content: string
  category: string
  created_at: string
  updated_at: string
}

export default function Knowledge() {
  const [cases, setCases] = useState<KnowledgeCase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      fetchKnowledgeCases()
    }
  }, [user])

  const fetchKnowledgeCases = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('knowledge_cases')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setCases(data || [])
    } catch (error: any) {
      console.error('Error fetching knowledge cases:', error)
      toast.error('Kunne ikke hente videns cases')
    } finally {
      setLoading(false)
    }
  }

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || case_.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(cases.map(c => c.category))].filter(Boolean)

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
            <BookOpenIcon className="h-8 w-8 text-blue-500 mr-3" />
            Videns Base
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Del og find viden på tværs af teamet
          </p>
        </div>
        <button
          onClick={() => toast.success('Opret viden funktionalitet kommer snart!')}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tilføj Viden
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
                  placeholder="Søg i viden..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">Alle kategorier</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('all')
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredCases.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen viden fundet</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || categoryFilter !== 'all'
                ? 'Prøv at justere dine filtre'
                : 'Tilføj din første videns artikel for at komme i gang'
              }
            </p>
          </div>
        ) : (
          filteredCases.map((case_) => (
            <div key={case_.id} className="card card-hover">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {case_.title}
                    </h3>
                    {case_.category && (
                      <span className="badge badge-secondary mb-3">
                        {case_.category}
                      </span>
                    )}
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {case_.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Oprettet {new Date(case_.created_at).toLocaleDateString('da-DK')}
                      </span>
                      <button
                        onClick={() => toast.success('Åbner videns artikel')}
                        className="text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Læs mere →
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
