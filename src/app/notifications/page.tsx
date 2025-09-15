'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useNotifications } from '@/components/providers/NotificationProvider'
import AppLayout from '@/components/layout/AppLayout'
import {
  BellIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

export default function NotificationsPage() {
  const { user } = useAuth()
  const { notifications, markAsRead, markAllAsRead } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.read
    }
    return true
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
      case 'error':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />
    }
  }

  const getNotificationBgColor = (type: string, read: boolean) => {
    const opacity = read ? 'bg-opacity-50' : 'bg-opacity-100'
    switch (type) {
      case 'success':
        return `bg-green-50 ${opacity}`
      case 'warning':
        return `bg-yellow-50 ${opacity}`
      case 'error':
        return `bg-red-50 ${opacity}`
      default:
        return `bg-blue-50 ${opacity}`
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifikationer</h1>
            <p className="mt-1 text-sm text-gray-500">
              Hold styr på vigtige opdateringer og aktiviteter
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Alle
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Ulæste
              </button>
            </div>
            
            {notifications.some(n => !n.read) && (
              <button
                onClick={markAllAsRead}
                className="btn-secondary flex items-center"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Marker alle som læst
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="card text-center py-12">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {filter === 'unread' ? 'Ingen ulæste notifikationer' : 'Ingen notifikationer'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'unread' 
                  ? 'Du har læst alle dine notifikationer.'
                  : 'Du har ikke modtaget nogen notifikationer endnu.'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`card transition-all duration-200 ${
                  getNotificationBgColor(notification.type, notification.read)
                } ${!notification.read ? 'border-l-4 border-primary-500' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          notification.read ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </h4>
                        <p className={`mt-1 text-sm ${
                          notification.read ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          {format(new Date(notification.created_at), 'dd MMM yyyy HH:mm', { locale: da })}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Marker som læst"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        <div className={`w-2 h-2 rounded-full ${
                          notification.read ? 'bg-gray-300' : 'bg-primary-500'
                        }`} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        {notifications.length > 0 && (
          <div className="card bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Total: {notifications.length} notifikationer
              </span>
              <span>
                Ulæste: {notifications.filter(n => !n.read).length}
              </span>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
