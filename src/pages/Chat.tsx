import { useState, useEffect, useRef } from 'react'
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline'
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

  const quickQuestions = [
    "Hvad er status på vores team lige nu?",
    "Hvilke bugs skal vi prioritere?",
    "Kan du analysere vores produktivitet?",
    "Hvad foreslår du vi fokuserer på i dag?",
    "Hjælp mig med at lære et projekt",
    "Hjælp mig med at skrive en god beskrivelse"
  ]

  const handleQuickQuestion = (question: string) => {
    setMessage(question)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg mr-4">
              <SparklesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">FlowCaser AI Assistent</h1>
              <p className="text-blue-100">Din professionelle team-assistent der hjælper med alt</p>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <SparklesIcon className="h-5 w-5 text-white mr-2" />
              <span className="font-medium">Team AI Assistent</span>
            </div>
            <p className="text-sm text-blue-100">
              Professionel hjælp med team data, planlægning og strategisk udvikling
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {messages.length === 0 ? (
          <div className="text-center">
            {/* AI Avatar */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-red-400 rounded-full mx-auto flex items-center justify-center mb-4">
                <SparklesIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Professionel AI Team-Assistent
              </h2>
              <p className="text-gray-600 mb-6">
                Jeg hjælper med team data, læsninger og professionelle råd
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Hurtige spørgsmål
              </button>
            </div>

            {/* Quick Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="text-sm text-gray-900">{question}</div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500">
              <p className="mb-2">
                💡 Spørg mig om alt! Jeg hjælper med team data, bugs, features, og giver professionelle råd
              </p>
              <div className="flex items-center justify-center space-x-4">
                <span>❤️ Lavet med kærlighed</span>
                <button className="text-blue-600 hover:text-blue-700">
                  🔗 Spørg AI
                </button>
                <button className="text-blue-600 hover:text-blue-700">
                  🔗 Vis med flowcaser
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.role === 'user'
                        ? 'bg-blue-100'
                        : 'bg-gradient-to-br from-pink-400 to-red-400'
                    }`}>
                      {msg.role === 'user' ? (
                        <UserIcon className="h-4 w-4 text-blue-600" />
                      ) : (
                        <SparklesIcon className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-4 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}>
                        <div
                          className={msg.role === 'user' ? 'text-white' : 'text-gray-900'}
                          dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                        />
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('da-DK')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-red-400 flex items-center justify-center">
                    <SparklesIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Skriv dit spørgsmål her..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
