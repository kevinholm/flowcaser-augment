import { createSupabaseClient } from './supabase'
import type { Bug, FeatureRequest, KnowledgeCase, TimeLog, Team } from './database.types'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  context?: {
    type: 'knowledge' | 'bugs' | 'features' | 'time' | 'general'
    data?: (Bug | FeatureRequest | KnowledgeCase | TimeLog)[]
  }
}

export interface AIContext {
  knowledge: KnowledgeCase[]
  bugs: Bug[]
  features: FeatureRequest[]
  timeLogs: TimeLog[]
  teamInfo: Team | null
}

class AIService {
  private supabase = createSupabaseClient()

  // Get context data from all modules for AI
  async getContext(teamId: string): Promise<AIContext> {
    try {
      const [knowledge, bugs, features, timeLogs, teamInfo] = await Promise.all([
        this.getKnowledgeContext(teamId),
        this.getBugsContext(teamId),
        this.getFeaturesContext(teamId),
        this.getTimeLogsContext(teamId),
        this.getTeamContext(teamId)
      ])

      return {
        knowledge,
        bugs,
        features,
        timeLogs,
        teamInfo
      }
    } catch (error) {
      console.error('Error getting AI context:', error)
      return {
        knowledge: [],
        bugs: [],
        features: [],
        timeLogs: [],
        teamInfo: null
      }
    }
  }

  private async getKnowledgeContext(teamId: string) {
    const { data } = await this.supabase
      .from('knowledge_cases')
      .select('id, title, content, category, tags, created_at')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(50)

    return data || []
  }

  private async getBugsContext(teamId: string) {
    const { data } = await this.supabase
      .from('bugs')
      .select('id, title, description, status, priority, created_at')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(50)

    return data || []
  }

  private async getFeaturesContext(teamId: string) {
    const { data } = await this.supabase
      .from('feature_requests')
      .select('id, title, description, status, priority, votes, created_at')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(50)

    return data || []
  }

  private async getTimeLogsContext(teamId: string) {
    const { data } = await this.supabase
      .from('time_logs')
      .select('id, description, hours, date, project')
      .eq('team_id', teamId)
      .order('date', { ascending: false })
      .limit(100)

    return data || []
  }

  private async getTeamContext(teamId: string) {
    const { data } = await this.supabase
      .from('teams')
      .select('id, name, description')
      .eq('id', teamId)
      .single()

    return data
  }

  // Process user query and generate AI response
  async processQuery(query: string, teamId: string, userId: string): Promise<AIMessage> {
    try {
      // Get context data
      const context = await this.getContext(teamId)
      
      // Analyze query to determine intent and relevant context
      const intent = this.analyzeIntent(query)
      const relevantContext = this.getRelevantContext(query, context, intent)

      // Generate response based on query and context
      const response = await this.generateResponse(query, relevantContext, intent)

      // Save the conversation to database
      await this.saveMessage({
        content: query,
        type: 'user',
        team_id: teamId,
        user_id: userId
      })

      await this.saveMessage({
        content: response.content,
        type: 'ai',
        team_id: teamId,
        user_id: null
      })

      return response
    } catch (error) {
      console.error('Error processing AI query:', error)
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Beklager, jeg kunne ikke behandle din forespørgsel. Prøv igen senere.',
        timestamp: new Date()
      }
    }
  }

  private analyzeIntent(query: string): string {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('bug') || lowerQuery.includes('fejl') || lowerQuery.includes('problem')) {
      return 'bugs'
    }
    if (lowerQuery.includes('feature') || lowerQuery.includes('funktion') || lowerQuery.includes('ønske')) {
      return 'features'
    }
    if (lowerQuery.includes('viden') || lowerQuery.includes('guide') || lowerQuery.includes('hvordan')) {
      return 'knowledge'
    }
    if (lowerQuery.includes('tid') || lowerQuery.includes('timer') || lowerQuery.includes('arbejde')) {
      return 'time'
    }
    if (lowerQuery.includes('team') || lowerQuery.includes('medlemmer') || lowerQuery.includes('kollega')) {
      return 'team'
    }
    
    return 'general'
  }

  private getRelevantContext(query: string, context: AIContext, intent: string) {
    const lowerQuery = query.toLowerCase()
    
    switch (intent) {
      case 'bugs':
        return {
          type: 'bugs',
          data: context.bugs.filter(bug => 
            bug.title.toLowerCase().includes(lowerQuery) ||
            bug.description.toLowerCase().includes(lowerQuery)
          ).slice(0, 10)
        }
      
      case 'features':
        return {
          type: 'features',
          data: context.features.filter(feature => 
            feature.title.toLowerCase().includes(lowerQuery) ||
            feature.description.toLowerCase().includes(lowerQuery)
          ).slice(0, 10)
        }
      
      case 'knowledge':
        return {
          type: 'knowledge',
          data: context.knowledge.filter(knowledge => 
            knowledge.title.toLowerCase().includes(lowerQuery) ||
            knowledge.content.toLowerCase().includes(lowerQuery) ||
            knowledge.category.toLowerCase().includes(lowerQuery)
          ).slice(0, 10)
        }
      
      case 'time':
        return {
          type: 'time',
          data: context.timeLogs.filter(log => 
            log.description.toLowerCase().includes(lowerQuery) ||
            log.project?.toLowerCase().includes(lowerQuery)
          ).slice(0, 20)
        }
      
      default:
        return {
          type: 'general',
          data: {
            bugs: context.bugs.slice(0, 5),
            features: context.features.slice(0, 5),
            knowledge: context.knowledge.slice(0, 5),
            timeLogs: context.timeLogs.slice(0, 10)
          }
        }
    }
  }

  private async generateResponse(query: string, context: any, intent: string): Promise<AIMessage> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY

    // If no API key configured, fall back to deterministic mock responses
    if (!apiKey) {
      const responses = this.getMockResponses(query, context, intent)
      const response = responses[Math.floor(Math.random() * responses.length)]
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        context
      }
    }

    try {
      // Summarize context to keep prompt compact
      const summarizeList = (items: any[], fields: string[], max = 8) =>
        (items || []).slice(0, max).map((it: any) => fields.map(f => `${f}: ${String(it[f] ?? '')}`).join(' | '))

      const contextSummary = {
        intent,
        knowledge: Array.isArray(context?.data) && context?.type === 'knowledge' ? context.data : [],
        bugs: Array.isArray(context?.data) && context?.type === 'bugs' ? context.data : [],
        features: Array.isArray(context?.data) && context?.type === 'features' ? context.data : [],
        timeLogs: Array.isArray(context?.data) && context?.type === 'time' ? context.data : [],
      }

      const systemPrompt = `Du er FlowCaser AI, en dansk assistent for et team. Svar kort og handlingsorienteret. Brug kontekst, hvis relevant. Brug punktopstilling ved behov. Undgå at opfinde data.`

      const userPrompt = [
        `Brugerens spørgsmål: ${query}`,
        `Intent: ${intent}`,
        contextSummary.knowledge.length ? `Viden:
${summarizeList(contextSummary.knowledge, ['title','category'], 10).join('\n')}` : '',
        contextSummary.bugs.length ? `Bugs:
${summarizeList(contextSummary.bugs, ['title','status','priority'], 10).join('\n')}` : '',
        contextSummary.features.length ? `Features:
${summarizeList(contextSummary.features, ['title','status','votes'], 10).join('\n')}` : '',
        contextSummary.timeLogs.length ? `Tid:
${summarizeList(contextSummary.timeLogs, ['description','hours','date'], 10).join('\n')}` : '',
      ].filter(Boolean).join('\n\n')

      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 600,
        })
      })

      if (!resp.ok) {
        throw new Error(`OpenAI API error ${resp.status}`)
      }

      const data = await resp.json()
      const content = data?.choices?.[0]?.message?.content?.trim() || 'Jeg kunne ikke generere et svar lige nu.'

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        context,
      }
    } catch (e) {
      console.error('OpenAI request failed, falling back to mock:', e)
      const responses = this.getMockResponses(query, context, intent)
      const response = responses[Math.floor(Math.random() * responses.length)]
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        context
      }
    }
  }

  private getMockResponses(query: string, context: any, intent: string): string[] {
    switch (intent) {
      case 'bugs':
        if (context.data.length === 0) {
          return [
            'Jeg kan ikke finde nogen bugs der matcher din søgning. Vil du oprette en ny bug rapport?',
            'Der er ingen åbne bugs relateret til din forespørgsel. Det er godt nyt!'
          ]
        }
        return [
          `Jeg fandt ${context.data.length} bugs relateret til din forespørgsel:\n\n${context.data.map((bug: any) => `• ${bug.title} (${bug.status})`).join('\n')}\n\nVil du have mere information om en specifik bug?`,
          `Her er de relevante bugs jeg fandt:\n\n${context.data.map((bug: any) => `• **${bug.title}**\n  Status: ${bug.status}, Prioritet: ${bug.priority}`).join('\n\n')}`
        ]

      case 'features':
        if (context.data.length === 0) {
          return [
            'Jeg kan ikke finde nogen feature requests der matcher din søgning. Vil du foreslå en ny feature?',
            'Der er ingen feature requests relateret til din forespørgsel endnu.'
          ]
        }
        return [
          `Jeg fandt ${context.data.length} feature requests:\n\n${context.data.map((feature: any) => `• ${feature.title} (${feature.status}) - ${feature.votes} stemmer`).join('\n')}`,
          `Her er de relevante feature requests:\n\n${context.data.map((feature: any) => `• **${feature.title}**\n  Status: ${feature.status}, Stemmer: ${feature.votes}`).join('\n\n')}`
        ]

      case 'knowledge':
        if (context.data.length === 0) {
          return [
            'Jeg kan ikke finde nogen videns artikler der matcher din søgning. Vil du oprette en ny videns case?',
            'Der er ingen viden tilgængelig om dette emne endnu.'
          ]
        }
        return [
          `Jeg fandt ${context.data.length} videns artikler:\n\n${context.data.map((knowledge: any) => `• ${knowledge.title} (${knowledge.category})`).join('\n')}`,
          `Her er den relevante viden jeg fandt:\n\n${context.data.map((knowledge: any) => `• **${knowledge.title}**\n  Kategori: ${knowledge.category}`).join('\n\n')}`
        ]

      case 'time':
        if (context.data.length === 0) {
          return [
            'Jeg kan ikke finde nogen tidsregistreringer der matcher din søgning.',
            'Der er ingen tidsdata tilgængelig for din forespørgsel.'
          ]
        }
        const totalHours = context.data.reduce((sum: number, log: any) => sum + log.hours, 0)
        return [
          `Jeg fandt ${context.data.length} tidsregistreringer med i alt ${totalHours} timer:\n\n${context.data.slice(0, 5).map((log: any) => `• ${log.description} - ${log.hours}t (${log.date})`).join('\n')}`,
          `Tidsregistreringer: ${totalHours} timer total i ${context.data.length} poster.`
        ]

      default:
        return [
          'Hej! Jeg er FlowCaser AI assistenten. Jeg kan hjælpe dig med at finde information om bugs, features, viden og tidsregistreringer. Hvad kan jeg hjælpe dig med?',
          'Jeg er her for at hjælpe! Spørg mig om bugs, feature requests, videns artikler eller tidsregistreringer.',
          'Hej! Jeg kan hjælpe dig med at navigere i FlowCaser. Prøv at spørge om specifikke bugs, features eller videns emner.'
        ]
    }
  }

  private async saveMessage(message: {
    content: string
    type: 'user' | 'ai' | 'system'
    team_id: string
    user_id: string | null
  }) {
    try {
      await this.supabase
        .from('chat_messages')
        .insert(message)
    } catch (error) {
      console.error('Error saving chat message:', error)
    }
  }

  // Get chat history
  async getChatHistory(teamId: string, limit: number = 50): Promise<AIMessage[]> {
    try {
      const { data } = await this.supabase
        .from('chat_messages')
        .select('id, content, type, created_at, users(full_name)')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .limit(limit)

      return (data || []).reverse().map(msg => ({
        id: msg.id,
        role: msg.type === 'ai' ? 'assistant' : 'user',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }))
    } catch (error) {
      console.error('Error getting chat history:', error)
      return []
    }
  }
}

export const aiService = new AIService()
