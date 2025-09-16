// Type verification file - this should compile without errors
// This file tests all the types we've defined to ensure they work correctly

import { supabase } from './supabase'
import type {
  Bug,
  FeatureRequest,
  KnowledgeCase,
  TimeLog,
  User,
  Team,
  ChatMessage,
  Notification,
  FileAttachment,
  BugInsert,
  BugUpdate,
  FeatureRequestInsert,
  FeatureRequestUpdate,
  KnowledgeCaseInsert,
  KnowledgeCaseUpdate,
  TimeLogInsert,
  TimeLogUpdate,
  UserInsert,
  UserUpdate,
  TeamInsert,
  TeamUpdate,
  ChatMessageInsert,
  NotificationInsert,
  FileAttachmentInsert,
  BugStatus,
  BugPriority,
  FeatureStatus,
  FeaturePriority,
  UserRole,
  NotificationType,
  MessageType,
  EntityType
} from './database.types'

// Test all basic types
function testBasicTypes() {
  // Test Bug
  const bug: Bug = {
    id: 'test-id',
    title: 'Test Bug',
    description: 'Test Description',
    status: 'open',
    priority: 'high',
    assigned_to: null,
    team_id: 'team-id',
    created_by: 'user-id',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }

  // Test FeatureRequest
  const feature: FeatureRequest = {
    id: 'test-id',
    title: 'Test Feature',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    votes: 0,
    team_id: 'team-id',
    created_by: 'user-id',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }

  // Test User
  const user: User = {
    id: 'user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    avatar_url: null,
    team_id: 'team-id',
    role: 'member',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }

  // Test FileAttachment with public_url
  const fileAttachment: FileAttachment = {
    id: 'file-id',
    filename: 'test.pdf',
    file_path: 'path/to/file.pdf',
    file_size: 1024,
    mime_type: 'application/pdf',
    entity_type: 'bug',
    entity_id: 'bug-id',
    team_id: 'team-id',
    uploaded_by: 'user-id',
    created_at: '2023-01-01T00:00:00Z',
    public_url: 'https://example.com/file.pdf'
  }

  return { bug, feature, user, fileAttachment }
}

// Test Insert types
function testInsertTypes() {
  const bugInsert: BugInsert = {
    title: 'New Bug',
    description: 'New Description',
    status: 'open',
    priority: 'medium',
    team_id: 'team-id',
    created_by: 'user-id'
  }

  const featureInsert: FeatureRequestInsert = {
    title: 'New Feature',
    description: 'New Description',
    team_id: 'team-id',
    created_by: 'user-id'
  }

  const userInsert: UserInsert = {
    id: 'user-id',
    email: 'new@example.com',
    full_name: 'New User',
    team_id: 'team-id',
    role: 'member'
  }

  return { bugInsert, featureInsert, userInsert }
}

// Test Update types
function testUpdateTypes() {
  const bugUpdate: BugUpdate = {
    status: 'resolved',
    priority: 'low'
  }

  const featureUpdate: FeatureRequestUpdate = {
    status: 'approved',
    votes: 5
  }

  const userUpdate: UserUpdate = {
    full_name: 'Updated Name',
    role: 'admin'
  }

  return { bugUpdate, featureUpdate, userUpdate }
}

// Test Supabase queries with proper typing
async function testSupabaseQueries() {
  // Test basic select queries
  const bugsQuery = supabase.from('bugs').select('*')
  const featuresQuery = supabase.from('feature_requests').select('*')
  const usersQuery = supabase.from('users').select('*')
  const timeLogsQuery = supabase.from('time_logs').select('*')

  // Test filtered queries
  const openBugs = supabase
    .from('bugs')
    .select('*')
    .eq('status', 'open')
    .eq('team_id', 'team-id')

  const pendingFeatures = supabase
    .from('feature_requests')
    .select('*')
    .eq('status', 'pending')
    .order('votes', { ascending: false })

  // Test insert queries
  const newBug: BugInsert = {
    title: 'Test Bug',
    description: 'Test Description',
    team_id: 'team-id',
    created_by: 'user-id'
  }

  const insertBug = supabase
    .from('bugs')
    .insert(newBug)
    .select('*')
    .single()

  // Test update queries
  const updateBug = supabase
    .from('bugs')
    .update({ status: 'resolved' })
    .eq('id', 'bug-id')
    .select('*')
    .single()

  // Test delete queries
  const deleteBug = supabase
    .from('bugs')
    .delete()
    .eq('id', 'bug-id')

  return {
    bugsQuery,
    featuresQuery,
    usersQuery,
    timeLogsQuery,
    openBugs,
    pendingFeatures,
    insertBug,
    updateBug,
    deleteBug
  }
}

// Test nullable types
function testNullableTypes() {
  // Test that nullable fields work correctly
  const userWithNulls: User = {
    id: 'user-id',
    email: 'test@example.com',
    full_name: null, // This should be allowed
    avatar_url: null, // This should be allowed
    team_id: null, // This should be allowed
    role: 'member',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }

  const bugWithNulls: Bug = {
    id: 'bug-id',
    title: 'Test Bug',
    description: 'Test Description',
    status: 'open',
    priority: 'medium',
    assigned_to: null, // This should be allowed
    team_id: 'team-id',
    created_by: 'user-id',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  }

  return { userWithNulls, bugWithNulls }
}

// Test enum types
function testEnumTypes() {
  const bugStatuses: BugStatus[] = ['open', 'in_progress', 'resolved', 'closed']
  const bugPriorities: BugPriority[] = ['low', 'medium', 'high', 'critical']
  const featureStatuses: FeatureStatus[] = ['pending', 'approved', 'in_development', 'completed', 'rejected']
  const featurePriorities: FeaturePriority[] = ['low', 'medium', 'high']
  const userRoles: UserRole[] = ['admin', 'member', 'viewer']
  const notificationTypes: NotificationType[] = ['info', 'success', 'warning', 'error']
  const messageTypes: MessageType[] = ['user', 'ai', 'system']
  const entityTypes: EntityType[] = ['bug', 'feature_request', 'knowledge_case', 'chat_message']

  return {
    bugStatuses,
    bugPriorities,
    featureStatuses,
    featurePriorities,
    userRoles,
    notificationTypes,
    messageTypes,
    entityTypes
  }
}

// Test environment variables
function testEnvironmentVariables() {
  // These should be properly typed thanks to vite-env.d.ts
  const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY

  return { supabaseUrl, supabaseAnonKey }
}

// Export all test functions
export {
  testBasicTypes,
  testInsertTypes,
  testUpdateTypes,
  testSupabaseQueries,
  testNullableTypes,
  testEnumTypes,
  testEnvironmentVariables
}

// This file should compile without any TypeScript errors
// If there are compilation errors, it means some types need to be fixed
