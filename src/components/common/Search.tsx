import { useState, useEffect, useRef, ReactNode } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Input } from './Input'
import Button from './Button'
import Badge from './Badge'

interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'bug' | 'feature' | 'knowledge' | 'time' | 'user'
  url?: string
  metadata?: Record<string, any>
}

interface SearchProps {
  placeholder?: string
  onSearch?: (query: string) => void
  onResultSelect?: (result: SearchResult) => void
  results?: SearchResult[]
  loading?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showResults?: boolean
  debounceMs?: number
}

export default function Search({
  placeholder = 'Søg...',
  onSearch,
  onResultSelect,
  results = [],
  loading = false,
  className = '',
  size = 'md',
  showResults = true,
  debounceMs = 300
}: SearchProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setIsOpen(false)
      return
    }

    const timer = setTimeout(() => {
      onSearch?.(query)
      if (showResults) {
        setIsOpen(true)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, onSearch, showResults, debounceMs])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleResultSelect(results[highlightedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleResultSelect = (result: SearchResult) => {
    onResultSelect?.(result)
    setQuery('')
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.blur()
  }

  const clearSearch = () => {
    setQuery('')
    setIsOpen(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const getResultIcon = (type: SearchResult['type']): ReactNode => {
    const iconClasses = "h-4 w-4"
    
    switch (type) {
      case 'bug':
        return <div className={`${iconClasses} bg-red-100 text-red-600 rounded p-0.5`}>🐛</div>
      case 'feature':
        return <div className={`${iconClasses} bg-yellow-100 text-yellow-600 rounded p-0.5`}>💡</div>
      case 'knowledge':
        return <div className={`${iconClasses} bg-blue-100 text-blue-600 rounded p-0.5`}>📚</div>
      case 'time':
        return <div className={`${iconClasses} bg-green-100 text-green-600 rounded p-0.5`}>⏰</div>
      case 'user':
        return <div className={`${iconClasses} bg-purple-100 text-purple-600 rounded p-0.5`}>👤</div>
      default:
        return <div className={`${iconClasses} bg-gray-100 text-gray-600 rounded p-0.5`}>📄</div>
    }
  }

  const getTypeLabel = (type: SearchResult['type']): string => {
    const labels = {
      bug: 'Bug',
      feature: 'Feature',
      knowledge: 'Viden',
      time: 'Tid',
      user: 'Bruger'
    }
    return labels[type] || 'Andet'
  }

  const highlightText = (text: string, query: string): ReactNode => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          size={size}
          icon={<MagnifyingGlassIcon className="h-5 w-5" />}
          iconPosition="left"
          className={`${sizeClasses[size]} ${query ? 'pr-10' : ''}`}
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="inline-flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-sm text-gray-500">Søger...</span>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center">
              <MagnifyingGlassIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Ingen resultater fundet for "{query}"
              </p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultSelect(result)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
                    ${index === highlightedIndex ? 'bg-blue-50' : ''}
                    ${index !== results.length - 1 ? 'border-b border-gray-100' : ''}
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getResultIcon(result.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {highlightText(result.title, query)}
                        </h4>
                        <Badge variant="secondary" size="sm">
                          {getTypeLabel(result.type)}
                        </Badge>
                      </div>
                      
                      {result.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {highlightText(result.description, query)}
                        </p>
                      )}
                      
                      {result.metadata && (
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                          {result.metadata.status && (
                            <span>Status: {result.metadata.status}</span>
                          )}
                          {result.metadata.priority && (
                            <span>Prioritet: {result.metadata.priority}</span>
                          )}
                          {result.metadata.category && (
                            <span>Kategori: {result.metadata.category}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Quick Search Component (for global search)
interface QuickSearchProps {
  onOpen?: () => void
  shortcut?: string
}

export function QuickSearch({ onOpen, shortcut = '⌘K' }: QuickSearchProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpen?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onOpen])

  return (
    <button
      onClick={onOpen}
      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <MagnifyingGlassIcon className="h-4 w-4" />
      <span className="flex-1 text-left">Søg i FlowCaser...</span>
      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
        {shortcut}
      </kbd>
    </button>
  )
}
