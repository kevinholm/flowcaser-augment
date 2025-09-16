import type { Bug, FeatureRequest, KnowledgeCase, TimeLog, ChatMessage, Notification } from './database.types'

// Type guards for database entities
export function isBug(item: any): item is Bug {
  return item && typeof item === 'object' && 'status' in item && 'priority' in item && 'title' in item && 'description' in item
}

export function isFeatureRequest(item: any): item is FeatureRequest {
  return item && typeof item === 'object' && 'votes' in item && 'title' in item && 'description' in item
}

export function isKnowledgeCase(item: any): item is KnowledgeCase {
  return item && typeof item === 'object' && 'content' in item && 'category' in item && 'title' in item
}

export function isTimeLog(item: any): item is TimeLog {
  return item && typeof item === 'object' && 'hours' in item && 'date' in item && 'description' in item
}

export function isChatMessage(item: any): item is ChatMessage {
  return item && typeof item === 'object' && 'type' in item && 'content' in item && ('user_id' in item || 'team_id' in item)
}

export function isNotification(item: any): item is Notification {
  return item && typeof item === 'object' && 'read' in item && 'type' in item && 'title' in item && 'message' in item
}

// Utility functions for type assertions
export function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error(`Expected string, got ${typeof value}`)
  }
}

export function assertIsNumber(value: unknown): asserts value is number {
  if (typeof value !== 'number') {
    throw new Error(`Expected number, got ${typeof value}`)
  }
}

export function assertIsArray<T>(value: unknown): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new Error(`Expected array, got ${typeof value}`)
  }
}

// Safe type conversion functions
export function safeString(value: unknown, defaultValue = ''): string {
  return typeof value === 'string' ? value : defaultValue
}

export function safeNumber(value: unknown, defaultValue = 0): number {
  return typeof value === 'number' ? value : defaultValue
}

export function safeArray<T>(value: unknown, defaultValue: T[] = []): T[] {
  return Array.isArray(value) ? value : defaultValue
}

export function safeBoolean(value: unknown, defaultValue = false): boolean {
  return typeof value === 'boolean' ? value : defaultValue
}

// Database response type guards
export function isSupabaseError(error: any): error is { message: string; code?: string } {
  return error && typeof error === 'object' && 'message' in error
}

export function hasSupabaseData<T>(response: any): response is { data: T; error: null } {
  return response && response.data !== null && response.error === null
}

// Form validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Entity type detection for search results
export function getEntityType(item: any): 'bug' | 'feature' | 'knowledge' | 'time' | 'unknown' {
  if (isBug(item)) return 'bug'
  if (isFeatureRequest(item)) return 'feature'
  if (isKnowledgeCase(item)) return 'knowledge'
  if (isTimeLog(item)) return 'time'
  return 'unknown'
}

// Priority and status type guards
export function isValidBugStatus(status: string): status is Bug['status'] {
  return ['open', 'in_progress', 'resolved', 'closed'].includes(status)
}

export function isValidBugPriority(priority: string): priority is Bug['priority'] {
  return ['low', 'medium', 'high', 'critical'].includes(priority)
}

export function isValidFeatureStatus(status: string): status is FeatureRequest['status'] {
  return ['pending', 'approved', 'in_development', 'completed', 'rejected'].includes(status)
}

export function isValidFeaturePriority(priority: string): priority is FeatureRequest['priority'] {
  return ['low', 'medium', 'high'].includes(priority)
}

export function isValidUserRole(role: string): role is 'admin' | 'member' | 'viewer' {
  return ['admin', 'member', 'viewer'].includes(role)
}

export function isValidNotificationType(type: string): type is Notification['type'] {
  return ['info', 'success', 'warning', 'error'].includes(type)
}
