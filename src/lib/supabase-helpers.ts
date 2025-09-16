import { supabase } from './supabase'
import type { 
  Database,
  Bug, 
  FeatureRequest, 
  KnowledgeCase, 
  TimeLog, 
  User, 
  Team,
  BugInsert,
  FeatureRequestInsert,
  KnowledgeCaseInsert,
  TimeLogInsert,
  BugUpdate,
  FeatureRequestUpdate,
  KnowledgeCaseUpdate,
  TimeLogUpdate
} from './database.types'

// Type-safe query builders
export class SupabaseQueryBuilder {
  // Bug queries with proper typing
  static bugs() {
    return supabase.from('bugs').select('*')
  }

  static bugById(id: string) {
    return supabase.from('bugs').select('*').eq('id', id).single()
  }

  static bugsByTeam(teamId: string) {
    return supabase.from('bugs').select('*').eq('team_id', teamId).order('created_at', { ascending: false })
  }

  static createBug(bug: BugInsert) {
    return supabase.from('bugs').insert(bug).select('*').single()
  }

  static updateBug(id: string, updates: BugUpdate) {
    return supabase.from('bugs').update(updates).eq('id', id).select('*').single()
  }

  static deleteBug(id: string) {
    return supabase.from('bugs').delete().eq('id', id)
  }

  // Feature request queries
  static features() {
    return supabase.from('feature_requests').select('*')
  }

  static featureById(id: string) {
    return supabase.from('feature_requests').select('*').eq('id', id).single()
  }

  static featuresByTeam(teamId: string) {
    return supabase.from('feature_requests').select('*').eq('team_id', teamId).order('created_at', { ascending: false })
  }

  static createFeature(feature: FeatureRequestInsert) {
    return supabase.from('feature_requests').insert(feature).select('*').single()
  }

  static updateFeature(id: string, updates: FeatureRequestUpdate) {
    return supabase.from('feature_requests').update(updates).eq('id', id).select('*').single()
  }

  static deleteFeature(id: string) {
    return supabase.from('feature_requests').delete().eq('id', id)
  }

  // Knowledge case queries
  static knowledgeCases() {
    return supabase.from('knowledge_cases').select('*')
  }

  static knowledgeCaseById(id: string) {
    return supabase.from('knowledge_cases').select('*').eq('id', id).single()
  }

  static knowledgeCasesByTeam(teamId: string) {
    return supabase.from('knowledge_cases').select('*').eq('team_id', teamId).order('created_at', { ascending: false })
  }

  static createKnowledgeCase(knowledgeCase: KnowledgeCaseInsert) {
    return supabase.from('knowledge_cases').insert(knowledgeCase).select('*').single()
  }

  static updateKnowledgeCase(id: string, updates: KnowledgeCaseUpdate) {
    return supabase.from('knowledge_cases').update(updates).eq('id', id).select('*').single()
  }

  static deleteKnowledgeCase(id: string) {
    return supabase.from('knowledge_cases').delete().eq('id', id)
  }

  // Time log queries
  static timeLogs() {
    return supabase.from('time_logs').select('*')
  }

  static timeLogById(id: string) {
    return supabase.from('time_logs').select('*').eq('id', id).single()
  }

  static timeLogsByTeam(teamId: string) {
    return supabase.from('time_logs').select('*').eq('team_id', teamId).order('date', { ascending: false })
  }

  static timeLogsByUser(userId: string) {
    return supabase.from('time_logs').select('*').eq('user_id', userId).order('date', { ascending: false })
  }

  static createTimeLog(timeLog: TimeLogInsert) {
    return supabase.from('time_logs').insert(timeLog).select('*').single()
  }

  static updateTimeLog(id: string, updates: TimeLogUpdate) {
    return supabase.from('time_logs').update(updates).eq('id', id).select('*').single()
  }

  static deleteTimeLog(id: string) {
    return supabase.from('time_logs').delete().eq('id', id)
  }

  // User queries
  static users() {
    return supabase.from('users').select('*')
  }

  static userById(id: string) {
    return supabase.from('users').select('*').eq('id', id).single()
  }

  static usersByTeam(teamId: string) {
    return supabase.from('users').select('*').eq('team_id', teamId).order('created_at', { ascending: true })
  }

  // Team queries
  static teams() {
    return supabase.from('teams').select('*')
  }

  static teamById(id: string) {
    return supabase.from('teams').select('*').eq('id', id).single()
  }
}

// Error handling utilities
export function handleSupabaseError(error: any): string {
  if (!error) return 'Unknown error occurred'
  
  if (typeof error === 'string') return error
  
  if (error.message) return error.message
  
  if (error.error_description) return error.error_description
  
  return 'An unexpected error occurred'
}

// Response type utilities
export type SupabaseResponse<T> = {
  data: T | null
  error: any
}

export function isSuccessResponse<T>(response: SupabaseResponse<T>): response is { data: T; error: null } {
  return response.error === null && response.data !== null
}

export function isErrorResponse<T>(response: SupabaseResponse<T>): response is { data: null; error: any } {
  return response.error !== null
}

// Query result processors
export function processQueryResult<T>(response: SupabaseResponse<T>): T {
  if (isErrorResponse(response)) {
    throw new Error(handleSupabaseError(response.error))
  }
  
  if (!response.data) {
    throw new Error('No data returned from query')
  }
  
  return response.data
}

export function processQueryResults<T>(response: SupabaseResponse<T[]>): T[] {
  if (isErrorResponse(response)) {
    throw new Error(handleSupabaseError(response.error))
  }
  
  return response.data || []
}

// Search utilities
export async function searchAcrossAllTables(query: string, teamId: string) {
  const searchTerm = `%${query}%`
  
  const [bugsResult, featuresResult, knowledgeResult, timeLogsResult] = await Promise.allSettled([
    SupabaseQueryBuilder.bugsByTeam(teamId).ilike('title', searchTerm),
    SupabaseQueryBuilder.featuresByTeam(teamId).ilike('title', searchTerm),
    SupabaseQueryBuilder.knowledgeCasesByTeam(teamId).ilike('title', searchTerm),
    SupabaseQueryBuilder.timeLogsByTeam(teamId).ilike('description', searchTerm)
  ])
  
  const results: (Bug | FeatureRequest | KnowledgeCase | TimeLog)[] = []
  
  if (bugsResult.status === 'fulfilled' && bugsResult.value.data) {
    results.push(...bugsResult.value.data)
  }
  
  if (featuresResult.status === 'fulfilled' && featuresResult.value.data) {
    results.push(...featuresResult.value.data)
  }
  
  if (knowledgeResult.status === 'fulfilled' && knowledgeResult.value.data) {
    results.push(...knowledgeResult.value.data)
  }
  
  if (timeLogsResult.status === 'fulfilled' && timeLogsResult.value.data) {
    results.push(...timeLogsResult.value.data)
  }
  
  return results
}
