'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createSupabaseClient } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout'
import toast from 'react-hot-toast'
import {
  UserIcon,
  UserGroupIcon,
  BellIcon,
  KeyIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

interface TeamMember {
  id: string
  full_name: string | null
  email: string
  role: 'admin' | 'member' | 'viewer'
  created_at: string
}

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  
  // Profile settings
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [email, setEmail] = useState(profile?.email || '')
  
  // Team settings
  const [teamName, setTeamName] = useState('')
  const [teamDescription, setTeamDescription] = useState('')
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  
  // Password settings
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const supabase = createSupabaseClient()

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setEmail(profile.email || '')
    }
  }, [profile])

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!profile?.team_id) return

      try {
        // Fetch team info
        const { data: teamData } = await supabase
          .from('teams')
          .select('*')
          .eq('id', profile.team_id)
          .single()

        if (teamData) {
          setTeamName(teamData.name)
          setTeamDescription(teamData.description || '')
        }

        // Fetch team members
        const { data: membersData } = await supabase
          .from('users')
          .select('id, full_name, email, role, created_at')
          .eq('team_id', profile.team_id)
          .order('created_at', { ascending: true })

        setTeamMembers(membersData || [])
      } catch (error) {
        console.error('Error fetching team data:', error)
      }
    }

    fetchTeamData()
  }, [profile?.team_id, supabase])

  const updateProfile = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName.trim() || null,
          email: email.trim(),
        })
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()
      toast.success('Profil opdateret!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Kunne ikke opdatere profil')
    } finally {
      setLoading(false)
    }
  }

  const updateTeam = async () => {
    if (!profile?.team_id || profile.role !== 'admin') return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: teamName.trim(),
          description: teamDescription.trim() || null,
        })
        .eq('id', profile.team_id)

      if (error) throw error

      toast.success('Team opdateret!')
    } catch (error: any) {
      console.error('Error updating team:', error)
      toast.error(error.message || 'Kunne ikke opdatere team')
    } finally {
      setLoading(false)
    }
  }

  const inviteMember = async () => {
    if (!profile?.team_id || !inviteEmail.trim()) return

    setLoading(true)
    try {
      // In a real app, this would send an invitation email
      // For now, we'll just show a success message
      toast.success(`Invitation sendt til ${inviteEmail}`)
      setInviteEmail('')
    } catch (error: any) {
      console.error('Error inviting member:', error)
      toast.error('Kunne ikke sende invitation')
    } finally {
      setLoading(false)
    }
  }

  const updateMemberRole = async (memberId: string, newRole: string) => {
    if (profile?.role !== 'admin') return

    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', memberId)

      if (error) throw error

      setTeamMembers(prev => 
        prev.map(member => 
          member.id === memberId ? { ...member, role: newRole as any } : member
        )
      )
      toast.success('Medlemsrolle opdateret!')
    } catch (error: any) {
      console.error('Error updating member role:', error)
      toast.error('Kunne ikke opdatere rolle')
    }
  }

  const removeMember = async (memberId: string) => {
    if (profile?.role !== 'admin' || memberId === user?.id) return

    if (!confirm('Er du sikker på, at du vil fjerne dette medlem fra teamet?')) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ team_id: null, role: 'member' })
        .eq('id', memberId)

      if (error) throw error

      setTeamMembers(prev => prev.filter(member => member.id !== memberId))
      toast.success('Medlem fjernet fra team')
    } catch (error: any) {
      console.error('Error removing member:', error)
      toast.error('Kunne ikke fjerne medlem')
    }
  }

  const updatePassword = async () => {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      toast.error('Udfyld alle felter korrekt')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Ny adgangskode skal være mindst 6 tegn')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success('Adgangskode opdateret!')
    } catch (error: any) {
      console.error('Error updating password:', error)
      toast.error(error.message || 'Kunne ikke opdatere adgangskode')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', name: 'Profil', icon: UserIcon },
    { id: 'team', name: 'Team', icon: UserGroupIcon },
    { id: 'notifications', name: 'Notifikationer', icon: BellIcon },
    { id: 'security', name: 'Sikkerhed', icon: KeyIcon },
  ]

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Indstillinger</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administrer din profil, team og kontoindstillinger
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Profil Indstillinger</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Fulde navn
                    </label>
                    <input
                      type="text"
                      className="mt-1 input-field"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      className="mt-1 input-field"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <button
                      onClick={updateProfile}
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? <div className="spinner mr-2"></div> : null}
                      Gem Ændringer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="space-y-6">
                {/* Team Info */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Team Indstillinger</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Team navn
                      </label>
                      <input
                        type="text"
                        className="mt-1 input-field"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        disabled={profile?.role !== 'admin'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Beskrivelse
                      </label>
                      <textarea
                        rows={3}
                        className="mt-1 textarea-field"
                        value={teamDescription}
                        onChange={(e) => setTeamDescription(e.target.value)}
                        disabled={profile?.role !== 'admin'}
                      />
                    </div>
                    {profile?.role === 'admin' && (
                      <div>
                        <button
                          onClick={updateTeam}
                          disabled={loading}
                          className="btn-primary"
                        >
                          {loading ? <div className="spinner mr-2"></div> : null}
                          Gem Team Ændringer
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Members */}
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Team Medlemmer</h3>
                  
                  {profile?.role === 'admin' && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Inviter nyt medlem</h4>
                      <div className="flex gap-3">
                        <input
                          type="email"
                          className="flex-1 input-field"
                          placeholder="Email adresse"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                        <button
                          onClick={inviteMember}
                          disabled={loading || !inviteEmail.trim()}
                          className="btn-primary"
                        >
                          Send Invitation
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.full_name || member.email}
                          </div>
                          <div className="text-sm text-gray-500">{member.email}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          {profile?.role === 'admin' && member.id !== user?.id ? (
                            <>
                              <select
                                value={member.role}
                                onChange={(e) => updateMemberRole(member.id, e.target.value)}
                                className="text-sm border-gray-300 rounded-md"
                              >
                                <option value="viewer">Viewer</option>
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                              </select>
                              <button
                                onClick={() => removeMember(member.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <span className="badge badge-primary text-xs">{member.role}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Notifikation Indstillinger</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Email notifikationer</div>
                      <div className="text-sm text-gray-500">Modtag emails om nye bugs og features</div>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Push notifikationer</div>
                      <div className="text-sm text-gray-500">Modtag push notifikationer i browseren</div>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Chat notifikationer</div>
                      <div className="text-sm text-gray-500">Notifikationer for nye chat beskeder</div>
                    </div>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Sikkerhed</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nuværende adgangskode
                    </label>
                    <input
                      type="password"
                      className="mt-1 input-field"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ny adgangskode
                    </label>
                    <input
                      type="password"
                      className="mt-1 input-field"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bekræft ny adgangskode
                    </label>
                    <input
                      type="password"
                      className="mt-1 input-field"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  <div>
                    <button
                      onClick={updatePassword}
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? <div className="spinner mr-2"></div> : null}
                      Opdater Adgangskode
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
