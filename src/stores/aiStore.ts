import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { searchAcrossAllTables } from '../lib/supabase-helpers'
import type { Bug, FeatureRequest, KnowledgeCase, TimeLog } from '../lib/database.types'

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  context?: {
    type: 'bug' | 'feature' | 'knowledge' | 'time'
    data: Bug | FeatureRequest | KnowledgeCase | TimeLog
  }
}

type SearchResult = Bug | FeatureRequest | KnowledgeCase | TimeLog

interface AIState {
  messages: ChatMessage[]
  loading: boolean
  searchResults: SearchResult[]
  sendMessage: (content: string, userId: string) => Promise<void>
  searchAcrossModules: (query: string, userId: string) => Promise<SearchResult[]>
  clearMessages: () => void
  getContextualResponse: (query: string, context: SearchResult[]) => Promise<string>
}

export const useAIStore = create<AIState>((set, get) => ({
  messages: [],
  loading: false,
  searchResults: [],

  sendMessage: async (content: string, userId: string) => {
    try {
      set({ loading: true })

      // Add user message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        role: 'user',
        timestamp: new Date().toISOString(),
      }

      set(state => ({
        messages: [...state.messages, userMessage]
      }))

      // Search for relevant context
      const searchResults = await get().searchAcrossModules(content, userId)
      
      // Generate AI response based on context
      const aiResponse = await get().getContextualResponse(content, searchResults)

      // Add AI message
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        context: searchResults.length > 0 ? {
          type: searchResults[0].type,
          data: searchResults
        } : undefined
      }

      set(state => ({
        messages: [...state.messages, aiMessage],
        searchResults,
        loading: false
      }))

    } catch (error) {
      console.error('Error sending message:', error)
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        content: 'Beklager, jeg kunne ikke behandle din besked. Prøv igen senere.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      }

      set(state => ({
        messages: [...state.messages, errorMessage],
        loading: false
      }))
    }
  },

  searchAcrossModules: async (query: string, userId: string) => {
    const results: any[] = []
    const searchTerm = query.toLowerCase()

    try {
      // Search in bugs
      const { data: bugs } = await supabase
        .from('bugs')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(5)

      if (bugs) {
        results.push(...bugs.map(bug => ({
          type: 'bug',
          id: bug.id,
          title: bug.title,
          description: bug.description,
          status: bug.status,
          priority: bug.priority,
          relevance: calculateRelevance(query, bug.title + ' ' + bug.description)
        })))
      }

      // Search in features
      const { data: features } = await supabase
        .from('feature_requests')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(5)

      if (features) {
        results.push(...features.map(feature => ({
          type: 'feature',
          id: feature.id,
          title: feature.title,
          description: feature.description,
          status: feature.status,
          votes: feature.votes,
          relevance: calculateRelevance(query, feature.title + ' ' + feature.description)
        })))
      }

      // Search in knowledge
      const { data: knowledge } = await supabase
        .from('knowledge_cases')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
        .limit(5)

      if (knowledge) {
        results.push(...knowledge.map(item => ({
          type: 'knowledge',
          id: item.id,
          title: item.title,
          content: item.content,
          category: item.category,
          relevance: calculateRelevance(query, item.title + ' ' + item.content)
        })))
      }

      // Search in time logs
      const { data: timeLogs } = await supabase
        .from('time_logs')
        .select('*')
        .or(`description.ilike.%${searchTerm}%,project.ilike.%${searchTerm}%`)
        .limit(5)

      if (timeLogs) {
        results.push(...timeLogs.map(log => ({
          type: 'time',
          id: log.id,
          description: log.description,
          project: log.project,
          hours: log.hours,
          date: log.date,
          relevance: calculateRelevance(query, log.description + ' ' + log.project)
        })))
      }

      // Sort by relevance
      return results.sort((a, b) => b.relevance - a.relevance).slice(0, 10)

    } catch (error) {
      console.error('Error searching across modules:', error)
      return []
    }
  },

  getContextualResponse: async (query: string, context: any[]) => {
    // This is a mock AI response generator
    // In a real implementation, you would call OpenAI API or similar
    
    if (context.length === 0) {
      return generateGenericResponse(query)
    }

    const contextTypes = [...new Set(context.map(item => item.type))]
    const topResults = context.slice(0, 3)

    let response = `Baseret på din søgning fandt jeg ${context.length} relevante resultater:\n\n`

    topResults.forEach((item, index) => {
      switch (item.type) {
        case 'bug':
          response += `🐛 **Bug**: ${item.title}\n`
          response += `   Status: ${getStatusLabel(item.status)} | Prioritet: ${getPriorityLabel(item.priority)}\n`
          response += `   ${item.description.substring(0, 100)}...\n\n`
          break
        case 'feature':
          response += `💡 **Feature**: ${item.title}\n`
          response += `   Status: ${getStatusLabel(item.status)} | Stemmer: ${item.votes}\n`
          response += `   ${item.description.substring(0, 100)}...\n\n`
          break
        case 'knowledge':
          response += `📚 **Viden**: ${item.title}\n`
          response += `   Kategori: ${item.category}\n`
          response += `   ${item.content.substring(0, 100)}...\n\n`
          break
        case 'time':
          response += `⏰ **Tid**: ${item.description}\n`
          response += `   Projekt: ${item.project} | Timer: ${item.hours}\n`
          response += `   Dato: ${new Date(item.date).toLocaleDateString('da-DK')}\n\n`
          break
      }
    })

    if (context.length > 3) {
      response += `... og ${context.length - 3} flere resultater.\n\n`
    }

    response += generateContextualAdvice(query, contextTypes)

    return response
  },

  clearMessages: () => set({ messages: [], searchResults: [] }),
}))

function calculateRelevance(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(' ')
  const textLower = text.toLowerCase()
  
  let score = 0
  queryWords.forEach(word => {
    if (textLower.includes(word)) {
      score += word.length
    }
  })
  
  return score
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    open: 'Åben',
    in_progress: 'I gang',
    resolved: 'Løst',
    closed: 'Lukket',
    pending: 'Afventer',
    approved: 'Godkendt',
    rejected: 'Afvist'
  }
  return labels[status] || status
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: 'Lav',
    medium: 'Medium',
    high: 'Høj',
    critical: 'Kritisk'
  }
  return labels[priority] || priority
}

function generateGenericResponse(query: string): string {
  const responses = [
    `Jeg forstår at du spørger om "${query}". Kan du være mere specifik om hvad du leder efter?`,
    `Baseret på din søgning efter "${query}" kunne jeg ikke finde specifikke resultater. Prøv at søge efter bugs, features, videns artikler eller tidsregistreringer.`,
    `Jeg kan hjælpe dig med at finde information om bugs, features, videns cases og tidsregistreringer. Hvad vil du gerne vide om "${query}"?`
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

function generateContextualAdvice(query: string, contextTypes: string[]): string {
  if (contextTypes.includes('bug')) {
    return `💡 **Tip**: Hvis du arbejder med bugs, kan du bruge filtrering efter status og prioritet for at finde de mest kritiske problemer.`
  }
  
  if (contextTypes.includes('feature')) {
    return `💡 **Tip**: Feature requests med flest stemmer bliver typisk prioriteret højest. Overvej at stemme på features du finder vigtige.`
  }
  
  if (contextTypes.includes('knowledge')) {
    return `💡 **Tip**: Videns artikler kan hjælpe dig med at løse lignende problemer. Overvej at oprette ny viden hvis du finder en løsning.`
  }
  
  if (contextTypes.includes('time')) {
    return `💡 **Tip**: Tidsregistreringer hjælper med at spore hvor meget tid der bruges på forskellige projekter og opgaver.`
  }
  
  return `💡 **Tip**: Brug global søgning (⌘K) for at finde information på tværs af alle moduler i FlowCaser.`
}
