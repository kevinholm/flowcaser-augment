import { useState, useEffect } from 'react'
import { Cog6ToothIcon, UserIcon, BellIcon, ShieldCheckIcon, KeyIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../stores/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import type { User } from '../lib/database.types'

interface TeamMember {
  id: string
  email: string
  full_name: string | null
  role: string | null
}

export default function Settings() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [teamId, setTeamId] = useState<string | null>(null)
  const [members, setMembers] = useState<TeamMember[]>([])

  useEffect(() => {
    const init = async () => {
      if (!user) return
      const { data: profile } = await supabase.from('users').select('team_id').eq('id', user.id).single()
      setTeamId(profile?.team_id || null)
      if (profile?.team_id) {
        const { data } = await supabase.from('users').select('id,email,full_name,role').eq('team_id', profile.team_id).order('created_at', { ascending: true })
        setMembers(data || [])
      }
    }
    init()
  }, [user])

  const tabs = [
    { id: 'profile', name: 'Profil', icon: UserIcon },
    { id: 'notifications', name: 'Notifikationer', icon: BellIcon },
    { id: 'security', name: 'Sikkerhed', icon: ShieldCheckIcon },
    { id: 'team', name: 'Team & Inviter', icon: UserIcon },
    { id: 'api', name: 'API', icon: KeyIcon },
  ]

  const handleSave = () => {
    toast.success('Indstillinger gemt!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Cog6ToothIcon className="h-8 w-8 text-gray-500 mr-3" />
          Indstillinger
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Administrer din konto og præferencer
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {/* Sidebar */}
        <div className="lg:w-64 mb-6 lg:mb-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Profil Information</h3>
                <p className="text-sm text-gray-500">Opdater dine personlige oplysninger</p>
              </div>
              <div className="card-body space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="form-input bg-gray-50"
                    />
                    <p className="form-help">Email kan ikke ændres</p>
                  </div>
                  <div>
                    <label className="form-label">Fulde navn</label>
                    <input
                      type="text"
                      placeholder="Dit fulde navn"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Titel</label>
                    <input
                      type="text"
                      placeholder="Din jobtitel"
                      className="form-input"
                    />
                  </div>
                  <div>
                    <label className="form-label">Telefon</label>
                    <input
                      type="tel"
                      placeholder="Dit telefonnummer"
                      className="form-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Fortæl lidt om dig selv..."
                    className="form-input"
                  />
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSave} className="btn-primary">
                    Gem ændringer
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Notifikationer</h3>
                <p className="text-sm text-gray-500">Vælg hvilke notifikationer du vil modtage</p>
              </div>
              <div className="card-body space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email notifikationer</h4>
                      <p className="text-sm text-gray-500">Modtag notifikationer via email</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Nye bugs</h4>
                      <p className="text-sm text-gray-500">Få besked når nye bugs rapporteres</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Feature updates</h4>
                      <p className="text-sm text-gray-500">Få besked om feature status ændringer</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Ugentlige rapporter</h4>
                      <p className="text-sm text-gray-500">Modtag ugentlige aktivitetsrapporter</p>
                    </div>
                    <input type="checkbox" className="h-4 w-4 text-blue-600 rounded" defaultChecked />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={handleSave} className="btn-primary">
                    Gem indstillinger
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">Skift adgangskode</h3>
                  <p className="text-sm text-gray-500">Opdater din adgangskode regelmæssigt</p>
                </div>
                <div className="card-body space-y-4">
                  <div>
                    <label className="form-label">Nuværende adgangskode</label>
                    <input type="password" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Ny adgangskode</label>
                    <input type="password" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Bekræft ny adgangskode</label>
                    <input type="password" className="form-input" />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleSave} className="btn-primary">
                      Opdater adgangskode
                    </button>
                  </div>
                </div>
              </div>

          {activeTab === 'team' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">Team & Inviter</h3>
                <p className="text-sm text-gray-500">Del et invite-link for at få kolleger ind i dit team</p>
              </div>
              <div className="card-body space-y-6">
                {!teamId ? (
                  <div className="alert-info">
                    <p>Du er ikke tilknyttet et team endnu. Opret et team eller få et invite-link fra en administrator.</p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="form-label">Invite-link</label>
                      <div className="flex space-x-2">
                        <input type="text" readOnly className="form-input flex-1" value={`${window.location.origin}/login?invite=${teamId}`} />
                        <button
                          className="btn-secondary"
                          onClick={async()=>{
                            try { await navigator.clipboard.writeText(`${window.location.origin}/login?invite=${teamId}`); toast.success('Invite-link kopieret') } catch { toast.error('Kunne ikke kopiere') }
                          }}
                        >Kopiér</button>
                      </div>
                      <p className="form-help">Del dette link. Når modtageren logger ind/opretter konto via linket, bliver de automatisk tilknyttet teamet.</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Teammedlemmer</h4>
                      {members.length === 0 ? (
                        <p className="text-sm text-gray-500">Ingen medlemmer endnu</p>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {members.map(m => (
                            <li key={m.id} className="py-2 flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{m.full_name || m.email}</div>
                                <div className="text-xs text-gray-500">{m.email}</div>
                              </div>
                              <span className="badge">{m.role || 'member'}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-medium text-gray-900">To-faktor autentificering</h3>
                  <p className="text-sm text-gray-500">Tilføj ekstra sikkerhed til din konto</p>
                </div>
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">2FA Status</h4>
                      <p className="text-sm text-gray-500">To-faktor autentificering er ikke aktiveret</p>
                    </div>
                    <button className="btn-primary">
                      Aktiver 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-medium text-gray-900">API Adgang</h3>
                <p className="text-sm text-gray-500">Administrer dine API nøgler og adgang</p>
              </div>
              <div className="card-body space-y-6">
                <div className="alert-info">
                  <p>API funktionalitet er under udvikling og vil snart være tilgængelig.</p>
                </div>
                <div>
                  <label className="form-label">API Nøgle</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      disabled
                      className="form-input bg-gray-50 flex-1"
                    />
                    <button className="btn-secondary">
                      Generer ny
                    </button>
                  </div>
                  <p className="form-help">Hold din API nøgle hemmelig og del den ikke med andre</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">API Dokumentation</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Lær hvordan du integrerer med FlowCaser API
                  </p>
                  <button className="btn-secondary">
                    Se dokumentation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
