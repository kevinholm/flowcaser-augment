import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import type { User as UserProfile } from '../../lib/database.types'
import { getUserProfile } from '../../lib/auth'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await getUserProfile(user.id)
      setProfile(userProfile)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      // Demo mode - create mock user if no Supabase
      if (!supabase) {
        const mockUser = {
          id: 'demo-user-id',
          email: 'demo@flowcaser.dk',
          user_metadata: { full_name: 'Demo Bruger' }
        } as any

        const mockProfile = {
          id: 'demo-user-id',
          email: 'demo@flowcaser.dk',
          full_name: 'Demo Bruger',
          team_id: 'demo-team-id',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as UserProfile

        setUser(mockUser)
        setProfile(mockProfile)
        setLoading(false)
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (session?.user) {
        const userProfile = await getUserProfile(session.user.id)
        setProfile(userProfile)
      }

      setLoading(false)
    }

    getInitialSession()

    if (!supabase) return

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          const userProfile = await getUserProfile(session.user.id)
          setProfile(userProfile)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
