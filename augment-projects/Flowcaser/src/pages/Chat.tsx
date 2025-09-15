import { useState, useEffect, useRef } from 'react'
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useAIStore } from '../stores/aiStore'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function Chat() {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, loading, sendMessage, clearMessages } = useAIStore()
  const { user } = useAuthStore()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !user || loading) return

    const messageToSend = message.trim()
    setMessage('')
    
    await sendMessage(messageToSend, user.id)
  }

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500 mr-3" />
              AI Assistant
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Spørg om bugs, features, viden og tidsregistreringer
            </p>
          </div>
          <button
            onClick={clearMessages}
            className="btn-secondary"
            disabled={messages.length === 0}
          >
            Ryd chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Velkommen til AI Assistant</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Jeg kan hjælpe dig med at finde information om bugs, features, videns artikler og tidsregistreringer. 
              Spørg mig om hvad som helst!
            </p>
            <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
              <button
                onClick={() => setMessage('Vis mig alle åbne bugs')}
                className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">Vis mig alle åbne bugs</div>
                <div className="text-xs text-gray-500">Se status på aktuelle problemer</div>
              </button>
              <button
                onClick={() => setMessage('Hvilke features har flest stemmer?')}
                className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">Hvilke features har flest stemmer?</div>
                <div className="text-xs text-gray-500">Find populære feature requests</div>
              </button>
              <button
                onClick={() => setMessage('Hvor mange timer har jeg registreret denne uge?')}
                className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900">Hvor mange timer har jeg registreret denne uge?</div>
                <div className="text-xs text-gray-500">Se din tidsregistrering</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center mb-2">
                      <SparklesIcon className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-xs font-medium text-gray-500">AI Assistant</span>
                    </div>
                  )}
                  <div
                    className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-gray-900'}`}
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                  <div className={`text-xs mt-1 ${
                    msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {new Date(msg.timestamp).toLocaleTimeString('da-DK', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="max-w-3xl px-4 py-2 rounded-lg bg-white border border-gray-200">
                  <div className="flex items-center">
                    <SparklesIcon className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-xs font-medium text-gray-500 mr-3">AI Assistant</span>
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-gray-500 ml-2">Tænker...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Spørg om bugs, features, viden eller tid..."
              className="form-input w-full"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={!message.trim() || loading}
            className="btn-primary"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
        <div className="mt-2 text-xs text-gray-500">
          AI Assistant kan søge på tværs af alle dine data og give intelligente svar
        </div>
      </div>
    </div>
  )
}
