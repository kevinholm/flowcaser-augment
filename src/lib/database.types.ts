export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          team_id: string | null
          role: 'admin' | 'member' | 'viewer'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          team_id?: string | null
          role?: 'admin' | 'member' | 'viewer'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          team_id?: string | null
          role?: 'admin' | 'member' | 'viewer'
          created_at?: string
          updated_at?: string
        }
      }
      knowledge_cases: {
        Row: {
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
        Insert: {
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
        Update: {
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
      }
      bugs: {
        Row: {
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
        Insert: {
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
        Update: {
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
      }
      feature_requests: {
        Row: {
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
        Insert: {
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
        Update: {
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
      }
      time_logs: {
        Row: {
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
        Insert: {
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
        Update: {
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
      }
      chat_messages: {
        Row: {
          id: string
          content: string
          type: 'user' | 'ai' | 'system'
          team_id: string
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          type?: 'user' | 'ai' | 'system'
          team_id: string
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          type?: 'user' | 'ai' | 'system'
          team_id?: string
          user_id?: string | null
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          entity_type: 'bug' | 'feature_request' | 'knowledge_case'
          entity_id: string
          team_id: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          entity_type: 'bug' | 'feature_request' | 'knowledge_case'
          entity_id: string
          team_id: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          entity_type?: 'bug' | 'feature_request' | 'knowledge_case'
          entity_id?: string
          team_id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          read: boolean
          team_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          message: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          team_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          read?: boolean
          team_id?: string
          user_id?: string
          created_at?: string
        }
      }
      file_attachments: {
        Row: {
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
        }
        Insert: {
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
        Update: {
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
