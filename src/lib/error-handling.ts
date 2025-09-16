import toast from 'react-hot-toast'
import type { AppError } from './types'

// Error classes
export class AppErrorClass extends Error implements AppError {
  code?: string
  details?: any

  constructor(message: string, code?: string, details?: any) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.details = details
  }
}

export class ValidationError extends AppErrorClass {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends AppErrorClass {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', details)
    this.name = 'NetworkError'
  }
}

export class AuthError extends AppErrorClass {
  constructor(message: string, details?: any) {
    super(message, 'AUTH_ERROR', details)
    this.name = 'AuthError'
  }
}

export class PermissionError extends AppErrorClass {
  constructor(message: string, details?: any) {
    super(message, 'PERMISSION_ERROR', details)
    this.name = 'PermissionError'
  }
}

// Error handling utilities
export function handleError(error: unknown): AppError {
  console.error('Error occurred:', error)

  if (error instanceof AppErrorClass) {
    return error
  }

  if (error instanceof Error) {
    return new AppErrorClass(error.message)
  }

  if (typeof error === 'string') {
    return new AppErrorClass(error)
  }

  if (error && typeof error === 'object') {
    const errorObj = error as any
    
    // Handle Supabase errors
    if (errorObj.message) {
      return new AppErrorClass(errorObj.message, errorObj.code, errorObj)
    }
    
    // Handle fetch errors
    if (errorObj.status && errorObj.statusText) {
      return new NetworkError(`${errorObj.status}: ${errorObj.statusText}`, errorObj)
    }
  }

  return new AppErrorClass('An unexpected error occurred')
}

export function showErrorToast(error: unknown): void {
  const appError = handleError(error)
  toast.error(appError.message)
}

export function showSuccessToast(message: string): void {
  toast.success(message)
}

export function showInfoToast(message: string): void {
  toast(message, { icon: 'ℹ️' })
}

export function showWarningToast(message: string): void {
  toast(message, { icon: '⚠️' })
}

// Async error wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options?: {
    showToast?: boolean
    fallbackValue?: T
    onError?: (error: AppError) => void
  }
): Promise<T | undefined> {
  try {
    return await operation()
  } catch (error) {
    const appError = handleError(error)
    
    if (options?.showToast) {
      showErrorToast(appError)
    }
    
    if (options?.onError) {
      options.onError(appError)
    }
    
    if (options?.fallbackValue !== undefined) {
      return options.fallbackValue
    }
    
    throw appError
  }
}

// Form validation helpers
export function validateRequired(value: any, fieldName: string): string | undefined {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} er påkrævet`
  }
  return undefined
}

export function validateEmail(email: string): string | undefined {
  if (!email) return 'Email er påkrævet'
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Ugyldig email adresse'
  }
  
  return undefined
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'Password er påkrævet'
  
  if (password.length < 6) {
    return 'Password skal være mindst 6 tegn'
  }
  
  return undefined
}

export function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
  if (!confirmPassword) return 'Bekræft password er påkrævet'
  
  if (password !== confirmPassword) {
    return 'Passwords matcher ikke'
  }
  
  return undefined
}

export function validateUrl(url: string): string | undefined {
  if (!url) return undefined // URL is optional
  
  try {
    new URL(url)
    return undefined
  } catch {
    return 'Ugyldig URL'
  }
}

export function validateNumber(value: any, fieldName: string, min?: number, max?: number): string | undefined {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} er påkrævet`
  }
  
  const num = Number(value)
  if (isNaN(num)) {
    return `${fieldName} skal være et tal`
  }
  
  if (min !== undefined && num < min) {
    return `${fieldName} skal være mindst ${min}`
  }
  
  if (max !== undefined && num > max) {
    return `${fieldName} må højst være ${max}`
  }
  
  return undefined
}

// Retry mechanism
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        break
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }
  
  throw handleError(lastError)
}

// Debounced error handler for form validation
export function createDebouncedValidator<T>(
  validator: (value: T) => string | undefined,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (value: T, callback: (error?: string) => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      const error = validator(value)
      callback(error)
    }, delay)
  }
}
