import { createSupabaseClient } from './supabase'
import { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
}

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  team_id: string | null
  role: 'admin' | 'member' | 'viewer'
  created_at: string
  updated_at: string
}

export interface Team {
  id: string
  name: string
  description: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export const signUp = async (email: string, password: string, fullName: string) => {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) throw error

  // Create user profile
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email!,
        full_name: fullName,
      })

    if (profileError) throw profileError
  }

  return data
}

export const signIn = async (email: string, password: string) => {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signOut = async () => {
  const supabase = createSupabaseClient()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const supabase = createSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user as AuthUser | null
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const createTeam = async (name: string, description?: string) => {
  const supabase = createSupabaseClient()
  const user = await getCurrentUser()
  
  if (!user) throw new Error('User not authenticated')

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({
      name,
      description,
      created_by: user.id,
    })
    .select()
    .single()

  if (teamError) throw teamError

  // Update user's team_id and make them admin
  const { error: userError } = await supabase
    .from('users')
    .update({
      team_id: team.id,
      role: 'admin',
    })
    .eq('id', user.id)

  if (userError) throw userError

  return team
}

export const joinTeam = async (teamId: string) => {
  const supabase = createSupabaseClient()
  const user = await getCurrentUser()
  
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('users')
    .update({
      team_id: teamId,
      role: 'member',
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getTeam = async (teamId: string): Promise<Team | null> => {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single()

  if (error) {
    console.error('Error fetching team:', error)
    return null
  }

  return data
}

export const getTeamMembers = async (teamId: string): Promise<UserProfile[]> => {
  const supabase = createSupabaseClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }

  return data || []
}
