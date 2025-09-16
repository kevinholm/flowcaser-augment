import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import type { Notification, NotificationInsert, NotificationUpdate } from '../lib/database.types'

// Re-export for convenience
export type { Notification }

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  subscribed: boolean
  fetchNotifications: (userId: string) => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: (userId: string) => Promise<void>
  subscribeToNotifications: (userId: string) => void
  unsubscribeFromNotifications: () => void
  addNotification: (notification: Omit<NotificationInsert, 'id' | 'created_at'>) => void
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  subscribed: false,

  fetchNotifications: async (userId: string) => {
    try {
      set({ loading: true })
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        throw error
      }

      const notifications = data || []
      const unreadCount = notifications.filter(n => !n.read).length

      set({ 
        notifications,
        unreadCount,
        loading: false 
      })
    } catch (error: unknown) {
      console.error('Error fetching notifications:', error)
      set({ loading: false })
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        throw error
      }

      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }))
    } catch (error: unknown) {
      console.error('Error marking notification as read:', error)
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) {
        throw error
      }

      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }))
    } catch (error: unknown) {
      console.error('Error marking all notifications as read:', error)
    }
  },

  subscribeToNotifications: (userId: string) => {
    const { subscribed } = get()
    
    if (subscribed) {
      return
    }

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification
          
          set(state => ({
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1
          }))

          // Show toast notification
          toast(newNotification.title, {
            icon: getNotificationIcon(newNotification.type),
            duration: 5000,
          })
        }
      )
      .subscribe()

    set({ subscribed: true })

    // Store channel reference for cleanup
    ;(window as any).__notificationChannel = channel
  },

  unsubscribeFromNotifications: () => {
    const channel = (window as any).__notificationChannel
    if (channel) {
      supabase.removeChannel(channel)
      delete (window as any).__notificationChannel
    }
    set({ subscribed: false })
  },

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }

    set(state => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }))
  },
}))

function getNotificationIcon(type: Notification['type']): string {
  switch (type) {
    case 'success':
      return '✅'
    case 'warning':
      return '⚠️'
    case 'error':
      return '❌'
    default:
      return 'ℹ️'
  }
}
