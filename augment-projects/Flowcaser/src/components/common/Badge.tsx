'use client'

import { ReactNode } from 'react'

export type BadgeVariant = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info'

export type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  icon?: ReactNode
  dot?: boolean
}

export default function Badge({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  icon,
  dot = false
}: BadgeProps) {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-cyan-100 text-cyan-800'
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  }

  const dotColors = {
    primary: 'bg-blue-500',
    secondary: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-cyan-500'
  }

  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {dot && (
        <span 
          className={`w-2 h-2 rounded-full mr-1.5 ${dotColors[variant]}`}
        />
      )}
      {icon && (
        <span className="mr-1">
          {icon}
        </span>
      )}
      {children}
    </span>
  )
}

// Status Badge Component
export type StatusType = 
  | 'open' 
  | 'in-progress' 
  | 'resolved' 
  | 'closed' 
  | 'pending' 
  | 'approved' 
  | 'rejected'
  | 'completed'

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusConfig = {
    open: { variant: 'primary' as BadgeVariant, text: 'Åben', dot: true },
    'in-progress': { variant: 'warning' as BadgeVariant, text: 'I gang', dot: true },
    resolved: { variant: 'success' as BadgeVariant, text: 'Løst', dot: true },
    closed: { variant: 'secondary' as BadgeVariant, text: 'Lukket', dot: false },
    pending: { variant: 'warning' as BadgeVariant, text: 'Afventer', dot: true },
    approved: { variant: 'success' as BadgeVariant, text: 'Godkendt', dot: true },
    rejected: { variant: 'danger' as BadgeVariant, text: 'Afvist', dot: false },
    completed: { variant: 'success' as BadgeVariant, text: 'Færdig', dot: false }
  }

  const config = statusConfig[status]

  return (
    <Badge 
      variant={config.variant} 
      dot={config.dot}
      className={className}
    >
      {config.text}
    </Badge>
  )
}

// Priority Badge Component
export type PriorityType = 'low' | 'medium' | 'high' | 'critical'

interface PriorityBadgeProps {
  priority: PriorityType
  className?: string
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const priorityConfig = {
    low: { variant: 'success' as BadgeVariant, text: 'Lav' },
    medium: { variant: 'warning' as BadgeVariant, text: 'Medium' },
    high: { variant: 'danger' as BadgeVariant, text: 'Høj' },
    critical: { variant: 'danger' as BadgeVariant, text: 'Kritisk' }
  }

  const config = priorityConfig[priority]

  return (
    <Badge 
      variant={config.variant}
      className={className}
    >
      {config.text}
    </Badge>
  )
}

// Category Badge Component
interface CategoryBadgeProps {
  category: string
  color?: string
  className?: string
}

export function CategoryBadge({ category, color, className = '' }: CategoryBadgeProps) {
  // Generate consistent color based on category name if no color provided
  const getColorFromString = (str: string) => {
    const colors: BadgeVariant[] = ['primary', 'success', 'warning', 'info', 'secondary']
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const variant = color ? (color as BadgeVariant) : getColorFromString(category)

  return (
    <Badge variant={variant} className={className}>
      {category}
    </Badge>
  )
}

// Count Badge Component (for notifications, etc.)
interface CountBadgeProps {
  count: number
  max?: number
  className?: string
  variant?: BadgeVariant
}

export function CountBadge({ 
  count, 
  max = 99, 
  className = '', 
  variant = 'danger' 
}: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString()

  if (count === 0) return null

  return (
    <Badge 
      variant={variant} 
      size="sm"
      className={`absolute -top-2 -right-2 min-w-[1.25rem] h-5 flex items-center justify-center ${className}`}
    >
      {displayCount}
    </Badge>
  )
}
