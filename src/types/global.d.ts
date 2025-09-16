// Global type declarations
/// <reference types="react" />
/// <reference types="react-dom" />

// Extend Window interface for any global variables
declare global {
  interface Window {
    __notificationChannel?: any
  }

  // JSX namespace for React components
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {}
    interface ElementAttributesProperty {
      props: {}
    }
    interface ElementChildrenAttribute {
      children: {}
    }
  }
}

// React component props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Common form field types
export interface FormField<T = string> {
  value: T
  error?: string
  touched?: boolean
}

// API response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

// Pagination types
export interface PaginationParams {
  page: number
  limit: number
  total?: number
}

// Filter types
export interface FilterParams {
  search?: string
  status?: string
  priority?: string
  category?: string
  dateFrom?: string
  dateTo?: string
}

// Sort types
export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

// Common entity metadata
export interface EntityMetadata {
  id: string
  created_at: string
  updated_at: string
}

// File upload types
export interface FileUpload {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

export {}
