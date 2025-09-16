import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import type { UserInsert } from '../lib/database.types'

interface AuthState {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        set({ user: data.user })
        toast.success('Velkommen tilbage!')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Der opstod en fejl ved login'
      console.error('Sign in error:', error)
      toast.error(errorMessage)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      set({ loading: true })
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Create user profile in database
        const userInsert: UserInsert = {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
        }

        const { error: profileError } = await supabase
          .from('users')
          .insert(userInsert)

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't throw here as auth user is already created
        }

        toast.success('Konto oprettet! Tjek din email for bekræftelse.')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Der opstod en fejl ved oprettelse af konto'
      console.error('Sign up error:', error)
      toast.error(errorMessage)
      throw error
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    try {
      set({ loading: true })
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }

      set({ user: null })
      toast.success('Du er nu logget ud')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Der opstod en fejl ved logout'
      console.error('Sign out error:', error)
      toast.error(errorMessage)
    } finally {
      set({ loading: false })
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ loading: true })
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      toast.success('Password reset email sendt!')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Der opstod en fejl ved password reset'
      console.error('Reset password error:', error)
      toast.error(errorMessage)
      throw error
    } finally {
      set({ loading: false })
    }
  },
}))
