'use client'

import { forwardRef, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { ExclamationCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface BaseInputProps {
  label?: string
  error?: string
  help?: string
  required?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

// Text Input Component
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, BaseInputProps {
  size?: 'sm' | 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  help,
  required = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  size = 'md',
  className = '',
  type = 'text',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-3 text-sm',
    lg: 'py-3 px-4 text-base'
  }

  const iconSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const baseInputClasses = `
    block border rounded-lg transition-colors duration-200 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
    ${icon || isPassword ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''}
    ${className}
  `

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`text-gray-400 ${iconSizeClasses[size]}`}>
              {icon}
            </span>
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={baseInputClasses}
          {...props}
        />
        
        {isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className={iconSizeClasses[size]} />
              ) : (
                <EyeIcon className={iconSizeClasses[size]} />
              )}
            </button>
          </div>
        )}
        
        {icon && iconPosition === 'right' && !isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={`text-gray-400 ${iconSizeClasses[size]}`}>
              {icon}
            </span>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className={`${iconSizeClasses[size]} text-red-500`} />
          </div>
        )}
      </div>
      
      {error && (
        <p className="form-error">{error}</p>
      )}
      
      {help && !error && (
        <p className="form-help">{help}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// Textarea Component
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {
  resize?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  help,
  required = false,
  fullWidth = true,
  resize = false,
  className = '',
  rows = 4,
  ...props
}, ref) => {
  const baseTextareaClasses = `
    block border rounded-lg transition-colors duration-200 placeholder-gray-400
    focus:outline-none focus:ring-2 focus:ring-offset-0 py-2 px-3 text-sm
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${resize ? 'resize-y' : 'resize-none'}
    ${error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
    ${className}
  `

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        rows={rows}
        className={baseTextareaClasses}
        {...props}
      />
      
      {error && (
        <p className="form-error">{error}</p>
      )}
      
      {help && !error && (
        <p className="form-help">{help}</p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

// Select Component
interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<InputHTMLAttributes<HTMLSelectElement>, 'size'>, BaseInputProps {
  options: SelectOption[]
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  help,
  required = false,
  fullWidth = true,
  size = 'md',
  options,
  placeholder,
  className = '',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-3 text-sm',
    lg: 'py-3 px-4 text-base'
  }

  const baseSelectClasses = `
    block border rounded-lg transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:opacity-50 disabled:cursor-not-allowed
    appearance-none bg-white
    ${fullWidth ? 'w-full' : ''}
    ${sizeClasses[size]}
    ${error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }
    ${className}
  `

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={baseSelectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="form-error">{error}</p>
      )}
      
      {help && !error && (
        <p className="form-help">{help}</p>
      )}
    </div>
  )
})

Select.displayName = 'Select'

// Checkbox Component
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>, BaseInputProps {
  description?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  error,
  help,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="relative flex items-start">
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="checkbox"
          className={`form-checkbox ${error ? 'border-red-300 focus:ring-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label className="font-medium text-gray-700">
              {label}
            </label>
          )}
          {description && (
            <p className="text-gray-500">{description}</p>
          )}
        </div>
      )}
      
      {error && (
        <p className="form-error mt-1">{error}</p>
      )}
      
      {help && !error && (
        <p className="form-help mt-1">{help}</p>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'
