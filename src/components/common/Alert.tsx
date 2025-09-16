import { ReactNode } from 'react'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

export type AlertVariant = 'success' | 'warning' | 'error' | 'info'

interface AlertProps {
  children: ReactNode
  variant?: AlertVariant
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
  icon?: ReactNode
}

export default function Alert({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className = '',
  icon
}: AlertProps) {
  const variantConfig = {
    success: {
      containerClass: 'bg-green-50 border-green-200',
      iconClass: 'text-green-400',
      titleClass: 'text-green-800',
      textClass: 'text-green-700',
      defaultIcon: CheckCircleIcon
    },
    warning: {
      containerClass: 'bg-yellow-50 border-yellow-200',
      iconClass: 'text-yellow-400',
      titleClass: 'text-yellow-800',
      textClass: 'text-yellow-700',
      defaultIcon: ExclamationTriangleIcon
    },
    error: {
      containerClass: 'bg-red-50 border-red-200',
      iconClass: 'text-red-400',
      titleClass: 'text-red-800',
      textClass: 'text-red-700',
      defaultIcon: XCircleIcon
    },
    info: {
      containerClass: 'bg-blue-50 border-blue-200',
      iconClass: 'text-blue-400',
      titleClass: 'text-blue-800',
      textClass: 'text-blue-700',
      defaultIcon: InformationCircleIcon
    }
  }

  const config = variantConfig[variant]
  const IconComponent = icon || config.defaultIcon

  return (
    <div className={`rounded-lg border p-4 ${config.containerClass} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          {typeof IconComponent === 'function' ? (
            <IconComponent className={`h-5 w-5 ${config.iconClass}`} />
          ) : (
            <span className={config.iconClass}>{IconComponent}</span>
          )}
        </div>
        
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.titleClass}`}>
              {title}
            </h3>
          )}
          <div className={`${title ? 'mt-2' : ''} text-sm ${config.textClass}`}>
            {children}
          </div>
        </div>
        
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onDismiss}
                className={`
                  inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${config.iconClass} hover:bg-opacity-20 hover:bg-current
                  focus:ring-offset-${variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : variant === 'error' ? 'red' : 'blue'}-50
                  focus:ring-${variant === 'success' ? 'green' : variant === 'warning' ? 'yellow' : variant === 'error' ? 'red' : 'blue'}-600
                `}
              >
                <span className="sr-only">Luk</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Toast Notification Component
interface ToastProps extends Omit<AlertProps, 'dismissible'> {
  visible: boolean
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export function Toast({
  visible,
  duration = 5000,
  position = 'top-right',
  onDismiss,
  ...alertProps
}: ToastProps) {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  // Auto dismiss
  if (visible && duration > 0 && onDismiss) {
    setTimeout(() => {
      onDismiss()
    }, duration)
  }

  if (!visible) return null

  return (
    <div className={`fixed z-50 max-w-sm w-full ${positionClasses[position]}`}>
      <div className={`transform transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}>
        <Alert
          {...alertProps}
          dismissible
          onDismiss={onDismiss}
          className="shadow-lg"
        />
      </div>
    </div>
  )
}

// Banner Alert Component
interface BannerProps extends Omit<AlertProps, 'className'> {
  sticky?: boolean
}

export function Banner({ sticky = false, ...alertProps }: BannerProps) {
  return (
    <div className={`${sticky ? 'sticky top-0 z-40' : ''}`}>
      <Alert
        {...alertProps}
        className="rounded-none border-x-0 border-t-0"
      />
    </div>
  )
}

// Inline Alert Component (smaller, for forms)
interface InlineAlertProps extends Omit<AlertProps, 'title' | 'dismissible'> {
  size?: 'sm' | 'md'
}

export function InlineAlert({ size = 'sm', className = '', ...alertProps }: InlineAlertProps) {
  const sizeClasses = {
    sm: 'p-2 text-xs',
    md: 'p-3 text-sm'
  }

  return (
    <Alert
      {...alertProps}
      className={`${sizeClasses[size]} ${className}`}
    />
  )
}

// Alert List Component (for multiple alerts)
interface AlertListProps {
  alerts: Array<{
    id: string
    variant: AlertVariant
    title?: string
    message: string
    dismissible?: boolean
  }>
  onDismiss?: (id: string) => void
  className?: string
}

export function AlertList({ alerts, onDismiss, className = '' }: AlertListProps) {
  if (alerts.length === 0) return null

  return (
    <div className={`space-y-4 ${className}`}>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          variant={alert.variant}
          title={alert.title}
          dismissible={alert.dismissible}
          onDismiss={() => onDismiss?.(alert.id)}
        >
          {alert.message}
        </Alert>
      ))}
    </div>
  )
}

// Status Alert Component (for API responses)
interface StatusAlertProps {
  status: 'loading' | 'success' | 'error' | 'idle'
  loadingMessage?: string
  successMessage?: string
  errorMessage?: string
  className?: string
}

export function StatusAlert({
  status,
  loadingMessage = 'Indlæser...',
  successMessage = 'Handlingen blev gennemført succesfuldt',
  errorMessage = 'Der opstod en fejl',
  className = ''
}: StatusAlertProps) {
  if (status === 'idle') return null

  const config = {
    loading: { variant: 'info' as AlertVariant, message: loadingMessage },
    success: { variant: 'success' as AlertVariant, message: successMessage },
    error: { variant: 'error' as AlertVariant, message: errorMessage }
  }

  const { variant, message } = config[status]

  return (
    <Alert variant={variant} className={className}>
      {message}
    </Alert>
  )
}
