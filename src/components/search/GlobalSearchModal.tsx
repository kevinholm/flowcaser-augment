import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { supabase } from '../../lib/supabase'
import Modal from '../common/Modal'
import Search from '../common/Search'
import Badge from '../common/Badge'
import {
  BugAntIcon,
  LightBulbIcon,
  BookOpenIcon,
  ClockIcon,
  UserIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'

interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'bug' | 'feature' | 'knowledge' | 'time' | 'user'
  url?: string
  metadata?: Record<string, any>
}

interface GlobalSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const { user } = useAuthStore()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('flowcaser-recent-searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }, [])

  const saveRecentSearch = (query: string) => {
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('flowcaser-recent-searches', JSON.stringify(updated))
  }

  const handleSearch = async (query: string) => {
    if (!query.trim() || !user?.team_id) {
      setResults([])
      return
    }

    setLoading(true)
    saveRecentSearch(query.trim())

    try {
      const searchTerm = `%${query.toLowerCase()}%`
      
      // Search in parallel across all modules
      const [bugsData, featuresData, knowledgeData, timeData, usersData] = await Promise.all([
        // Search bugs
        supabase
          .from('bugs')
          .select('id, title, description, status, priority')
          .eq('team_id', user.team_id)
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(10),

        // Search features
        supabase
          .from('feature_requests')
          .select('id, title, description, status, priority, votes')
          .eq('team_id', user.team_id)
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .limit(10),

        // Search knowledge
        supabase
          .from('knowledge_cases')
          .select('id, title, content, category, tags')
          .eq('team_id', user.team_id)
          .or(`title.ilike.${searchTerm},content.ilike.${searchTerm},category.ilike.${searchTerm}`)
          .limit(10),

        // Search time logs
        supabase
          .from('time_logs')
          .select('id, description, hours, date, project')
          .eq('team_id', user.team_id)
          .or(`description.ilike.${searchTerm},project.ilike.${searchTerm}`)
          .limit(10),

        // Search users
        supabase
          .from('users')
          .select('id, full_name, email, role')
          .eq('team_id', user.team_id)
          .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .limit(5)
      ])

      const searchResults: SearchResult[] = []

      // Process bugs
      if (bugsData.data) {
        searchResults.push(...bugsData.data.map(bug => ({
          id: bug.id,
          title: bug.title,
          description: bug.description,
          type: 'bug' as const,
          url: `/bugs/${bug.id}`,
          metadata: {
            status: bug.status,
            priority: bug.priority
          }
        })))
      }

      // Process features
      if (featuresData.data) {
        searchResults.push(...featuresData.data.map(feature => ({
          id: feature.id,
          title: feature.title,
          description: feature.description,
          type: 'feature' as const,
          url: `/features/${feature.id}`,
          metadata: {
            status: feature.status,
            priority: feature.priority,
            votes: feature.votes
          }
        })))
      }

      // Process knowledge
      if (knowledgeData.data) {
        searchResults.push(...knowledgeData.data.map(knowledge => ({
          id: knowledge.id,
          title: knowledge.title,
          description: knowledge.content.substring(0, 150) + '...',
          type: 'knowledge' as const,
          url: `/knowledge/${knowledge.id}`,
          metadata: {
            category: knowledge.category,
            tags: knowledge.tags
          }
        })))
      }

      // Process time logs
      if (timeData.data) {
        searchResults.push(...timeData.data.map(timeLog => ({
          id: timeLog.id,
          title: timeLog.description,
          description: `${timeLog.hours} timer - ${timeLog.project || 'Intet projekt'}`,
          type: 'time' as const,
          url: `/time`,
          metadata: {
            hours: timeLog.hours,
            date: timeLog.date,
            project: timeLog.project
          }
        })))
      }

      // Process users
      if (usersData.data) {
        searchResults.push(...usersData.data.map(user => ({
          id: user.id,
          title: user.full_name || user.email,
          description: `${user.email} - ${user.role}`,
          type: 'user' as const,
          url: `/settings`,
          metadata: {
            role: user.role,
            email: user.email
          }
        })))
      }

      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleResultSelect = (result: SearchResult) => {
    if (result.url) {
      window.location.href = result.url
    }
    onClose()
  }

  const quickActions = [
    {
      title: 'Opret ny bug',
      description: 'Rapporter en ny bug',
      icon: BugAntIcon,
      url: '/bugs/new',
      color: 'text-red-600'
    },
    {
      title: 'Foreslå feature',
      description: 'Indsend en feature anmodning',
      icon: LightBulbIcon,
      url: '/features/new',
      color: 'text-yellow-600'
    },
    {
      title: 'Tilføj viden',
      description: 'Del viden med teamet',
      icon: BookOpenIcon,
      url: '/knowledge/new',
      color: 'text-blue-600'
    },
    {
      title: 'Log tid',
      description: 'Registrer arbejdstid',
      icon: ClockIcon,
      url: '/time/new',
      color: 'text-green-600'
    }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className="max-w-2xl"
    >
      <div className="p-6">
        {/* Search Input */}
        <div className="mb-6">
          <Search
            placeholder="Søg i bugs, features, viden, tid og mere..."
            onSearch={handleSearch}
            onResultSelect={handleResultSelect}
            results={results}
            loading={loading}
            size="lg"
            showResults={false}
            className="w-full"
          />
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Søgeresultater ({results.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultSelect(result)}
                  className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {result.type === 'bug' && <BugAntIcon className="h-5 w-5 text-red-600" />}
                      {result.type === 'feature' && <LightBulbIcon className="h-5 w-5 text-yellow-600" />}
                      {result.type === 'knowledge' && <BookOpenIcon className="h-5 w-5 text-blue-600" />}
                      {result.type === 'time' && <ClockIcon className="h-5 w-5 text-green-600" />}
                      {result.type === 'user' && <UserIcon className="h-5 w-5 text-purple-600" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </h4>
                        <Badge variant="secondary" size="sm">
                          {result.type === 'bug' ? 'Bug' :
                           result.type === 'feature' ? 'Feature' :
                           result.type === 'knowledge' ? 'Viden' :
                           result.type === 'time' ? 'Tid' : 'Bruger'}
                        </Badge>
                      </div>
                      
                      {result.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && results.length === 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Seneste søgninger
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(search)}
                  className="px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Hurtige handlinger
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <a
                key={index}
                href={action.url}
                onClick={onClose}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <action.icon className={`h-5 w-5 ${action.color} group-hover:scale-110 transition-transform`} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">
                      {action.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {action.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Tryk <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">Esc</kbd> for at lukke
          </p>
        </div>
      </div>
    </Modal>
  )
}
