export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Direct type definitions for all database tables
export interface Team {
  id: string
  name: string
  description: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  team_id: string | null
  role: 'admin' | 'member' | 'viewer'
  created_at: string
  updated_at: string
}

export interface Bug {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_to: string | null
  team_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface FeatureRequest {
  id: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'in_development' | 'completed' | 'rejected'
  priority: 'low' | 'medium' | 'high'
  votes: number
  team_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface KnowledgeCase {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  team_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface TimeLog {
  id: string
  description: string
  hours: number
  date: string
  project: string | null
  team_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  content: string
  type: 'user' | 'ai' | 'system'
  team_id: string
  user_id: string | null
  created_at: string
}

export interface Comment {
  id: string
  content: string
  entity_type: 'bug' | 'feature_request' | 'knowledge_case'
  entity_id: string
  team_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  team_id: string
  user_id: string
  created_at: string
}

export interface FileAttachment {
  id: string
  filename: string
  file_path: string
  file_size: number
  mime_type: string
  entity_type: 'bug' | 'feature_request' | 'knowledge_case' | 'chat_message'
  entity_id: string
  team_id: string
  uploaded_by: string
  created_at: string
  public_url?: string
}

// Insert types (for creating new records)
export interface TeamInsert {
  id?: string
  name: string
  description?: string | null
  created_by: string
  created_at?: string
  updated_at?: string
}

export interface UserInsert {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  team_id?: string | null
  role?: 'admin' | 'member' | 'viewer'
  created_at?: string
  updated_at?: string
}

export interface BugInsert {
  id?: string
  title: string
  description: string
  status?: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  assigned_to?: string | null
  team_id: string
  created_by: string
  created_at?: string
  updated_at?: string
}

export interface FeatureRequestInsert {
  id?: string
  title: string
  description: string
  status?: 'pending' | 'approved' | 'in_development' | 'completed' | 'rejected'
  priority?: 'low' | 'medium' | 'high'
  votes?: number
  team_id: string
  created_by: string
  created_at?: string
  updated_at?: string
}

export interface KnowledgeCaseInsert {
  id?: string
  title: string
  content: string
  category: string
  tags?: string[]
  team_id: string
  created_by: string
  created_at?: string
  updated_at?: string
}

export interface TimeLogInsert {
  id?: string
  description: string
  hours: number
  date: string
  project?: string | null
  team_id: string
  user_id: string
  created_at?: string
  updated_at?: string
}

export interface ChatMessageInsert {
  id?: string
  content: string
  type?: 'user' | 'ai' | 'system'
  team_id: string
  user_id?: string | null
  created_at?: string
}

export interface CommentInsert {
  id?: string
  content: string
  entity_type: 'bug' | 'feature_request' | 'knowledge_case'
  entity_id: string
  team_id: string
  user_id: string
  created_at?: string
  updated_at?: string
}

export interface NotificationInsert {
  id?: string
  title: string
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  read?: boolean
  team_id: string
  user_id: string
  created_at?: string
}

export interface FileAttachmentInsert {
  id?: string
  filename: string
  file_path: string
  file_size: number
  mime_type: string
  entity_type: 'bug' | 'feature_request' | 'knowledge_case' | 'chat_message'
  entity_id: string
  team_id: string
  uploaded_by: string
  created_at?: string
}

// Update types (for updating existing records)
export interface TeamUpdate {
  id?: string
  name?: string
  description?: string | null
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface UserUpdate {
  id?: string
  email?: string
  full_name?: string | null
  avatar_url?: string | null
  team_id?: string | null
  role?: 'admin' | 'member' | 'viewer'
  created_at?: string
  updated_at?: string
}

export interface BugUpdate {
  id?: string
  title?: string
  description?: string
  status?: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  assigned_to?: string | null
  team_id?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface FeatureRequestUpdate {
  id?: string
  title?: string
  description?: string
  status?: 'pending' | 'approved' | 'in_development' | 'completed' | 'rejected'
  priority?: 'low' | 'medium' | 'high'
  votes?: number
  team_id?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface KnowledgeCaseUpdate {
  id?: string
  title?: string
  content?: string
  category?: string
  tags?: string[]
  team_id?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface TimeLogUpdate {
  id?: string
  description?: string
  hours?: number
  date?: string
  project?: string | null
  team_id?: string
  user_id?: string
  created_at?: string
  updated_at?: string
}

export interface ChatMessageUpdate {
  id?: string
  content?: string
  type?: 'user' | 'ai' | 'system'
  team_id?: string
  user_id?: string | null
  created_at?: string
}

export interface CommentUpdate {
  id?: string
  content?: string
  entity_type?: 'bug' | 'feature_request' | 'knowledge_case'
  entity_id?: string
  team_id?: string
  user_id?: string
  created_at?: string
  updated_at?: string
}

export interface NotificationUpdate {
  id?: string
  title?: string
  message?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  read?: boolean
  team_id?: string
  user_id?: string
  created_at?: string
}

export interface FileAttachmentUpdate {
  id?: string
  filename?: string
  file_path?: string
  file_size?: number
  mime_type?: string
  entity_type?: 'bug' | 'feature_request' | 'knowledge_case' | 'chat_message'
  entity_id?: string
  team_id?: string
  uploaded_by?: string
  created_at?: string
}

// Database interface for Supabase
export interface Database {
  public: {
    Tables: {
      teams: {
        Row: Team
        Insert: TeamInsert
        Update: TeamUpdate
      }
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      bugs: {
        Row: Bug
        Insert: BugInsert
        Update: BugUpdate
      }
      feature_requests: {
        Row: FeatureRequest
        Insert: FeatureRequestInsert
        Update: FeatureRequestUpdate
      }
      knowledge_cases: {
        Row: KnowledgeCase
        Insert: KnowledgeCaseInsert
        Update: KnowledgeCaseUpdate
      }
      time_logs: {
        Row: TimeLog
        Insert: TimeLogInsert
        Update: TimeLogUpdate
      }
      chat_messages: {
        Row: ChatMessage
        Insert: ChatMessageInsert
        Update: ChatMessageUpdate
      }
      comments: {
        Row: Comment
        Insert: CommentInsert
        Update: CommentUpdate
      }
      notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: NotificationUpdate
      }
      file_attachments: {
        Row: FileAttachment
        Insert: FileAttachmentInsert
        Update: FileAttachmentUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Utility types for easier access
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Type aliases for backward compatibility
export type UserProfile = User
export type BugReport = Bug
export type Feature = FeatureRequest
export type Knowledge = KnowledgeCase
export type TimeEntry = TimeLog
export type Message = ChatMessage

// Status and priority types
export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type BugPriority = 'low' | 'medium' | 'high' | 'critical'
export type FeatureStatus = 'pending' | 'approved' | 'in_development' | 'completed' | 'rejected'
export type FeaturePriority = 'low' | 'medium' | 'high'
export type UserRole = 'admin' | 'member' | 'viewer'
export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type MessageType = 'user' | 'ai' | 'system'
export type EntityType = 'bug' | 'feature_request' | 'knowledge_case' | 'chat_message'

// Supabase Database interface structure
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      teams: {
        Row: Team
        Insert: TeamInsert
        Update: TeamUpdate
      }
      bugs: {
        Row: Bug
        Insert: BugInsert
        Update: BugUpdate
      }
      feature_requests: {
        Row: FeatureRequest
        Insert: FeatureRequestInsert
        Update: FeatureRequestUpdate
      }
      knowledge_cases: {
        Row: KnowledgeCase
        Insert: KnowledgeCaseInsert
        Update: KnowledgeCaseUpdate
      }
      time_logs: {
        Row: TimeLog
        Insert: TimeLogInsert
        Update: TimeLogUpdate
      }
      chat_messages: {
        Row: ChatMessage
        Insert: ChatMessageInsert
        Update: ChatMessageUpdate
      }
      comments: {
        Row: Comment
        Insert: CommentInsert
        Update: CommentUpdate
      }
      notifications: {
        Row: Notification
        Insert: NotificationInsert
        Update: NotificationUpdate
      }
      file_attachments: {
        Row: FileAttachment
        Insert: FileAttachmentInsert
        Update: FileAttachmentUpdate
      }
    }
  }
}
