// This file is used to verify that all types are working correctly
// It should compile without errors if all types are properly defined

import type {
  Database,
  Bug,
  FeatureRequest,
  KnowledgeCase,
  TimeLog,
  User,
  Team,
  ChatMessage,
  Notification,
  BugInsert,
  FeatureRequestInsert,
  KnowledgeCaseInsert,
  TimeLogInsert,
  BugUpdate,
  FeatureRequestUpdate,
  KnowledgeCaseUpdate,
  TimeLogUpdate
} from './database.types'

import { supabase } from './supabase'
import { SupabaseQueryBuilder } from './supabase-helpers'
import {
  isBug,
  isFeatureRequest,
  isKnowledgeCase,
  isTimeLog,
  isValidBugStatus,
  isValidBugPriority
} from './type-guards'

// Test database types
function testDatabaseTypes() {
  // Test Bug types
  const bug: Bug = {
    id: 'test',
    title: 'Test Bug',
    description: 'Test Description',
    status: 'open',
    priority: 'medium',
    assigned_to: null,
    team_id: 'team-1',
    created_by: 'user-1',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }

  const bugInsert: BugInsert = {
    title: 'New Bug',
    description: 'New Description',
    status: 'open',
    priority: 'high',
    team_id: 'team-1',
    created_by: 'user-1'
  }

  const bugUpdate: BugUpdate = {
    status: 'resolved',
    priority: 'low'
  }

  // Test FeatureRequest types
  const feature: FeatureRequest = {
    id: 'test',
    title: 'Test Feature',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    votes: 0,
    team_id: 'team-1',
    created_by: 'user-1',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }

  const featureInsert: FeatureRequestInsert = {
    title: 'New Feature',
    description: 'New Description',
    team_id: 'team-1',
    created_by: 'user-1'
  }

  // Test KnowledgeCase types
  const knowledge: KnowledgeCase = {
    id: 'test',
    title: 'Test Knowledge',
    content: 'Test Content',
    category: 'general',
    tags: ['test'],
    team_id: 'team-1',
    created_by: 'user-1',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }

  // Test TimeLog types
  const timeLog: TimeLog = {
    id: 'test',
    description: 'Test Work',
    hours: 8,
    date: '2023-01-01',
    project: 'Test Project',
    team_id: 'team-1',
    user_id: 'user-1',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }

  // Test User types
  const user: User = {
    id: 'test',
    email: 'test@example.com',
    full_name: 'Test User',
    avatar_url: null,
    team_id: 'team-1',
    role: 'member',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }

  // Test Team types
  const team: Team = {
    id: 'test',
    name: 'Test Team',
    description: 'Test Description',
    created_by: 'user-1',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }

  return { bug, bugInsert, bugUpdate, feature, featureInsert, knowledge, timeLog, user, team }
}

// Test Supabase queries
async function testSupabaseQueries() {
  // Test basic queries
  const bugsQuery = supabase.from('bugs').select('*')
  const featuresQuery = supabase.from('feature_requests').select('*')
  const knowledgeQuery = supabase.from('knowledge_cases').select('*')
  const timeLogsQuery = supabase.from('time_logs').select('*')

  // Test query builder
  const bugById = SupabaseQueryBuilder.bugById('test-id')
  const bugsByTeam = SupabaseQueryBuilder.bugsByTeam('team-id')
  
  const featureById = SupabaseQueryBuilder.featureById('test-id')
  const featuresByTeam = SupabaseQueryBuilder.featuresByTeam('team-id')

  // Test insert operations
  const newBug: BugInsert = {
    title: 'Test Bug',
    description: 'Test Description',
    team_id: 'team-1',
    created_by: 'user-1'
  }
  
  const createBugQuery = SupabaseQueryBuilder.createBug(newBug)

  // Test update operations
  const bugUpdate: BugUpdate = {
    status: 'resolved'
  }
  
  const updateBugQuery = SupabaseQueryBuilder.updateBug('bug-id', bugUpdate)

  return {
    bugsQuery,
    featuresQuery,
    knowledgeQuery,
    timeLogsQuery,
    bugById,
    bugsByTeam,
    featureById,
    featuresByTeam,
    createBugQuery,
    updateBugQuery
  }
}

// Test type guards
function testTypeGuards() {
  const bug: Bug = {
    id: 'test',
    title: 'Test Bug',
    description: 'Test Description',
    status: 'open',
    priority: 'medium',
    assigned_to: null,
    team_id: 'team-1',
    created_by: 'user-1',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }

  const feature: FeatureRequest = {
    id: 'test',
    title: 'Test Feature',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    votes: 0,
    team_id: 'team-1',
    created_by: 'user-1',
    created_at: '2023-01-01',
    updated_at: '2023-01-01'
  }

  // Test type guards
  const isBugResult = isBug(bug) // should be true
  const isFeatureResult = isFeatureRequest(feature) // should be true
  const isBugFromFeature = isBug(feature) // should be false

  // Test validation functions
  const isValidStatus = isValidBugStatus('open') // should be true
  const isInvalidStatus = isValidBugStatus('invalid') // should be false
  const isValidPriority = isValidBugPriority('high') // should be true

  return {
    isBugResult,
    isFeatureResult,
    isBugFromFeature,
    isValidStatus,
    isInvalidStatus,
    isValidPriority
  }
}

// Test environment variables
function testEnvironmentVariables() {
  // These should be properly typed thanks to vite-env.d.ts
  const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY

  return { supabaseUrl, supabaseAnonKey }
}

// Export test functions (these won't be called in production)
export {
  testDatabaseTypes,
  testSupabaseQueries,
  testTypeGuards,
  testEnvironmentVariables
}

// This file should compile without any TypeScript errors
// If there are errors, it means some types are not properly defined
