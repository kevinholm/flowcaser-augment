'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { aiService, AIMessage } from '@/lib/ai'
import Button from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Badge from '@/components/common/Badge'
import {
  PaperAirplaneIcon,
  SparklesIcon,
  UserIcon,
  ClockIcon,
  BugAntIcon,
  LightBulbIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline'

interface AIChatProps {
  className?: string
}

export default function AIChat({ className = '' }: AIChatProps) {
  const { profile } = useAuth()
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChatHistory()
  }, [profile?.team_id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatHistory = async () => {
    if (!profile?.team_id) return

    try {
      const history = await aiService.getChatHistory(profile.team_id)
      setMessages(history)
    } catch (error) {
      console.error('Error loading chat history:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !profile?.team_id || loading) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const aiResponse = await aiService.processQuery(
        input.trim(),
        profile.team_id,
        profile.id
      )
      
      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: AIMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Beklager, der opstod en fejl. Prøv igen senere.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const getMessageIcon = (message: AIMessage) => {
    if (message.role === 'user') {
      return <UserIcon className="h-5 w-5" />
    }

    if (message.context?.type) {
      switch (message.context.type) {
        case 'bugs':
          return <BugAntIcon className="h-5 w-5 text-red-500" />
        case 'features':
          return <LightBulbIcon className="h-5 w-5 text-yellow-500" />
        case 'knowledge':
          return <BookOpenIcon className="h-5 w-5 text-blue-500" />
        case 'time':
          return <ClockIcon className="h-5 w-5 text-green-500" />
        default:
          return <SparklesIcon className="h-5 w-5 text-purple-500" />
      }
    }

    return <SparklesIcon className="h-5 w-5 text-purple-500" />
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Nu'
    if (minutes < 60) return `${minutes}m siden`
    if (hours < 24) return `${hours}t siden`
    return `${days}d siden`
  }

  const quickActions = [
    {
      label: 'Vis åbne bugs',
      query: 'Vis mig alle åbne bugs',
      icon: <BugAntIcon className="h-4 w-4" />
    },
    {
      label: 'Nye features',
      query: 'Hvilke nye features er foreslået?',
      icon: <LightBulbIcon className="h-4 w-4" />
    },
    {
      label: 'Seneste viden',
      query: 'Vis seneste videns artikler',
      icon: <BookOpenIcon className="h-4 w-4" />
    },
    {
      label: 'Tidsstatistik',
      query: 'Hvor mange timer har jeg logget denne uge?',
      icon: <ClockIcon className="h-4 w-4" />
    }
  ]

  if (initialLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <LoadingSpinner size="lg" text="Indlæser chat..." />
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <SparklesIcon className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">AI Assistant</h3>
            <p className="text-sm text-gray-500">Spørg mig om alt i FlowCaser</p>
          </div>
        </div>
        <Badge variant="success" size="sm" dot>
          Online
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Velkommen til AI Assistant!
            </h4>
            <p className="text-gray-500 mb-6">
              Jeg kan hjælpe dig med at finde information om bugs, features, viden og meget mere.
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setInput(action.query)}
                  className="justify-start text-left"
                  icon={action.icon}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`flex-shrink-0 p-2 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-100' 
                  : 'bg-gray-100'
              }`}>
                {getMessageIcon(message)}
              </div>
              
              <div className={`flex-1 max-w-xs sm:max-w-md ${
                message.role === 'user' ? 'text-right' : ''
              }`}>
                <div className={`p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                
                <div className={`flex items-center mt-1 space-x-2 ${
                  message.role === 'user' ? 'justify-end' : ''
                }`}>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(message.timestamp)}
                  </span>
                  {message.context?.type && (
                    <Badge variant="secondary" size="sm">
                      {message.context.type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 p-2 rounded-lg bg-gray-100">
              <SparklesIcon className="h-5 w-5 text-purple-500" />
            </div>
            <div className="flex-1 max-w-xs sm:max-w-md">
              <div className="p-3 rounded-lg bg-white border border-gray-200">
                <LoadingSpinner size="sm" text="Tænker..." />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Skriv din besked..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!input.trim() || loading}
            icon={<PaperAirplaneIcon className="h-5 w-5" />}
          >
            Send
          </Button>
        </form>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          AI kan lave fejl. Verificer vigtige informationer.
        </p>
      </div>
    </div>
  )
}
