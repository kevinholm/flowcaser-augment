import { useState, useEffect } from 'react'
import {
  Cog6ToothIcon,
  UserIcon,
  UsersIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import Button from '../components/common/Button'
import { Input } from '../components/common/Input'
import type { User } from '../lib/database.types'

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  role: string | null
  created_at: string
}

export default function Settings() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [teamId, setTeamId] = useState<string | null>(null)
  const [teamName, setTeamName] = useState<string>('')
  const [members, setMembers] = useState<TeamMember[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || ''
  })
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (!user) return

      // Get user's team info
      const { data: profile } = await supabase
        .from('users')
        .select('team_id')
        .eq('id', user.id)
        .single()

      setTeamId(profile?.team_id || null)

      if (profile?.team_id) {
        // Get team name
        const { data: team } = await supabase
          .from('teams')
          .select('name')
          .eq('id', profile.team_id)
          .single()

        setTeamName(team?.name || '')

        // Get team members
        const { data: teamMembers } = await supabase
          .from('users')
          .select('id, email, full_name, role, created_at')
          .eq('team_id', profile.team_id)
          .order('created_at', { ascending: true })

        setMembers(teamMembers || [])
      }
    }
    init()
  }, [user])

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileForm.full_name,
          email: profileForm.email
        })
        .eq('id', user?.id)

      if (error) throw error
      toast.success('Profil opdateret!')
    } catch (error) {
      toast.error('Fejl ved opdatering af profil')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async () => {
    if (!inviteEmail || !teamId) return

    setLoading(true)
    try {
      // In a real app, this would send an invitation email
      toast.success(`Invitation sendt til ${inviteEmail}`)
      setInviteEmail('')
      setShowInviteModal(false)
    } catch (error) {
      toast.error('Fejl ved afsendelse af invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Cog6ToothIcon className="h-6 w-6 text-gray-400 mr-3" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Indstillinger</h1>
              <p className="text-sm text-gray-500">Administrer din profil og team</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Profil
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'team'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <UsersIcon className="h-4 w-4 mr-1" />
              Team
            </button>
            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-500">
              <Cog6ToothIcon className="h-4 w-4 mr-1" />
              Administration
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Min Profil Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Min Profil</h2>
              </div>
              <p className="text-sm text-gray-500 mb-6">Opdater dine personlige oplysninger</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Navn
                  </label>
                  <Input
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Dit fulde navn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="din@email.dk"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handleSaveProfile}
                  loading={loading}
                  variant="primary"
                >
                  Gem ændringer
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Team Information Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Team Information</h2>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6">Grundlæggende information om dit team</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Navn
                  </label>
                  <Input
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Dit team navn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Oprettet
                  </label>
                  <div className="text-sm text-gray-500 py-2">
                    {new Date().toLocaleDateString('da-DK')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medlemmer
                  </label>
                  <div className="text-sm text-gray-500 py-2">
                    {members.length} personer
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="secondary">
                  Gem ændringer
                </Button>
              </div>
            </div>

            {/* Team Members Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Team Medlemmer</h2>
                </div>
                <Button
                  onClick={() => setShowInviteModal(true)}
                  variant="primary"
                  size="sm"
                  icon={<PlusIcon className="h-4 w-4" />}
                >
                  Inviter bruger
                </Button>
              </div>
              <p className="text-sm text-gray-500 mb-6">Administrer og inviter medlemmer</p>

              <div className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <UserIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.full_name || 'Unavngivet bruger'}
                        </div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {new Date(member.created_at).toLocaleDateString('da-DK')}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {member.role || 'Medlem'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Inviter ny bruger</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email adresse
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="bruger@email.dk"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowInviteModal(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Annuller
                </Button>
                <Button
                  onClick={handleInviteMember}
                  variant="primary"
                  loading={loading}
                  className="flex-1"
                >
                  Send invitation
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
