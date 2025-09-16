// Re-export all database types for easier imports
export type {
  Json,
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  Team,
  User,
  Bug,
  FeatureRequest,
  KnowledgeCase,
  TimeLog,
  ChatMessage,
  Comment,
  Notification,
  FileAttachment,
  TeamInsert,
  UserInsert,
  BugInsert,
  FeatureRequestInsert,
  KnowledgeCaseInsert,
  TimeLogInsert,
  ChatMessageInsert,
  CommentInsert,
  NotificationInsert,
  FileAttachmentInsert,
  TeamUpdate,
  UserUpdate,
  BugUpdate,
  FeatureRequestUpdate,
  KnowledgeCaseUpdate,
  TimeLogUpdate,
  ChatMessageUpdate,
  CommentUpdate,
  NotificationUpdate,
  FileAttachmentUpdate
} from './database.types'

// Re-export type guards
export * from './type-guards'

// Re-export Supabase helpers
export * from './supabase-helpers'

// Common application types
export interface AppError {
  message: string
  code?: string
  details?: any
}

export interface LoadingState {
  loading: boolean
  error?: AppError | null
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  limit: number
  hasMore: boolean
}

export interface SearchFilters {
  query?: string
  status?: string
  priority?: string
  category?: string
  assignedTo?: string
  createdBy?: string
  dateFrom?: string
  dateTo?: string
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

// Form types
export interface FormState<T> {
  data: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isValid: boolean
  isSubmitting: boolean
}

// Component prop types
export interface BaseProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends BaseProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export interface InputProps extends BaseProps {
  label?: string
  placeholder?: string
  error?: string
  required?: boolean
  disabled?: boolean
  value?: string
  onChange?: (value: string) => void
}

// API response types
export interface ApiSuccess<T = any> {
  success: true
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: string
  code?: string
  details?: any
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError

// Auth types
export interface AuthState {
  user: User | null
  loading: boolean
  error?: AppError | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials extends LoginCredentials {
  fullName: string
  confirmPassword: string
}

// Dashboard types
export interface DashboardStats {
  totalBugs: number
  openBugs: number
  resolvedBugs: number
  totalFeatures: number
  pendingFeatures: number
  approvedFeatures: number
  totalKnowledge: number
  totalTimeThisWeek: number
  totalTimeThisMonth: number
}

export interface ActivityItem {
  id: string
  type: 'bug' | 'feature' | 'knowledge' | 'time'
  action: 'created' | 'updated' | 'deleted' | 'completed'
  title: string
  user: string
  timestamp: string
  data?: any
}

// Notification types
export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  bugUpdates: boolean
  featureUpdates: boolean
  teamInvites: boolean
  mentions: boolean
}

// File upload types
export interface FileUploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  url?: string
}

// Search result types
export interface SearchResult {
  id: string
  type: 'bug' | 'feature' | 'knowledge' | 'time'
  title: string
  description?: string
  content?: string
  relevance: number
  highlights?: string[]
  metadata?: Record<string, any>
}

// Team management types
export interface TeamInvite {
  id: string
  teamId: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  invitedBy: string
  createdAt: string
  expiresAt: string
}

export interface TeamMember extends User {
  joinedAt: string
  lastActive?: string
  permissions: string[]
}

// Settings types
export interface UserSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'da' | 'en'
  timezone: string
  notifications: NotificationPreferences
  privacy: {
    profileVisible: boolean
    activityVisible: boolean
  }
}

export interface TeamSettings {
  name: string
  description?: string
  visibility: 'private' | 'public'
  allowInvites: boolean
  requireApproval: boolean
  defaultRole: 'member' | 'viewer'
}

// Export utility type for making all properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Export utility type for making all properties required
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>
