import { useState, useEffect } from 'react'
import { LightBulbIcon, PlusIcon, MagnifyingGlassIcon, HandThumbUpIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { FormModal, ConfirmModal } from '../components/common/Modal'
import type { FeatureRequest, FeatureRequestInsert, FeatureRequestUpdate } from '../lib/database.types'

// Alias for convenience
type Feature = FeatureRequest

export default function Features() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const { user } = useAuthStore()
  const [teamId, setTeamId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selected, setSelected] = useState<Feature | null>(null)
  const [createForm, setCreateForm] = useState({ title: '', description: '', priority: 'medium' as 'low'|'medium'|'high' })
  const [editForm, setEditForm] = useState({ title: '', description: '', status: 'pending' as Feature['status'] })


  useEffect(() => {
    const init = async () => {
      if (!user) return
      const { data: profile } = await supabase.from('users').select('team_id').eq('id', user.id).single()
      setTeamId(profile?.team_id || null)
      await fetchFeatures(profile?.team_id || null)
    }
    init()
  }, [user])

  const fetchFeatures = async (team?: string | null) => {
    try {
      setLoading(true)
      let query = supabase
        .from('feature_requests')
        .select('*')
        .order('votes', { ascending: false })
      if (team) query = query.eq('team_id', team)

      const { data, error } = await query
      if (error) throw error
      setFeatures(data || [])
    } catch (error: any) {
      console.error('Error fetching features:', error)
      toast.error('Kunne ikke hente features')
    } finally {
      setLoading(false)
    }
  }
  const resetForms = () => {
    setCreateForm({ title: '', description: '', priority: 'medium' })
    setEditForm({ title: '', description: '', status: 'pending' })
  }

  const createFeatureSubmit = async () => {
    if (!user || !teamId) { toast.error('Kræver bruger og team'); return }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('feature_requests').insert({
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        priority: createForm.priority,
        status: 'pending',
        votes: 0,
        team_id: teamId,
        created_by: user.id,
      })
      if (error) throw error
      toast.success('Feature oprettet')
      setShowCreate(false)
      resetForms()
      await fetchFeatures(teamId)
    } catch (e) {
      console.error(e)
      toast.error('Kunne ikke oprette feature')
    } finally {
      setSubmitting(false)
    }
  }

  const updateFeatureSubmit = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('feature_requests').update({
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        status: editForm.status,
      }).eq('id', selected.id)
      if (error) throw error
      toast.success('Feature opdateret')
      setShowEdit(false)
      setSelected(null)
      resetForms()
      await fetchFeatures(teamId)
    } catch (e) {
      console.error(e)
      toast.error('Kunne ikke opdatere feature')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteFeatureSubmit = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('feature_requests').delete().eq('id', selected.id)
      if (error) throw error
      toast.success('Feature slettet')
      setShowDelete(false)
      setSelected(null)
      await fetchFeatures(teamId)
    } catch (e) {
      console.error(e)
      toast.error('Kunne ikke slette feature')
    } finally {
      setSubmitting(false)
    }
  }


  const filteredFeatures = features.filter(feature => {
    const matchesSearch = feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || feature.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      in_development: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    }

    const labels = {
      pending: 'Afventer',
      approved: 'Godkendt',
      in_development: 'Under udvikling',
      completed: 'Færdig',
      rejected: 'Afvist'
    }

    return (
      <span className={`badge ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  const handleVote = async (featureId: string) => {
    try {
      const feature = features.find(f => f.id === featureId)
      if (!feature) return
      const newVotes = (feature.votes || 0) + 1
      setFeatures(prev => prev.map(f => f.id === featureId ? { ...f, votes: newVotes } : f))
      const { error } = await supabase.from('feature_requests').update({ votes: newVotes }).eq('id', featureId)
      if (error) throw error
      toast.success('Stemme afgivet!')
    } catch (e) {
      toast.error('Kunne ikke afgive stemme')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <LightBulbIcon className="h-8 w-8 text-yellow-500 mr-3" />
            Feature Ønsker
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Foreslå og stem på nye funktioner
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Foreslå Feature
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="form-label">Søg</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Søg i features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">Alle status</option>
                <option value="pending">Afventer</option>
                <option value="approved">Godkendt</option>
                <option value="in_development">Under udvikling</option>
                <option value="completed">Færdig</option>
                <option value="rejected">Afvist</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
                className="btn-secondary w-full"
              >
                Ryd filtre
              </button>
            </div>
          </div>

      {/* Create Feature Modal */}
      <FormModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Foreslå feature"
        onSubmit={createFeatureSubmit}
        loading={submitting}
        submitDisabled={!createForm.title.trim() || !createForm.description.trim()}
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">Titel</label>
            <input className="form-input" value={createForm.title} onChange={(e)=>setCreateForm(v=>({...v,title:e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Beskrivelse</label>
            <textarea className="form-input" rows={4} value={createForm.description} onChange={(e)=>setCreateForm(v=>({...v,description:e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Prioritet</label>
            <select className="form-input" value={createForm.priority} onChange={(e)=>setCreateForm(v=>({...v,priority:e.target.value as any}))}>
              <option value="low">Lav</option>
              <option value="medium">Mellem</option>
              <option value="high">Høj</option>
            </select>
          </div>
        </div>
      </FormModal>

      {/* Edit Feature Modal */}
      <FormModal
        isOpen={showEdit}
        onClose={() => { setShowEdit(false); setSelected(null) }}
        title="Rediger feature"
        onSubmit={updateFeatureSubmit}
        loading={submitting}
        submitDisabled={!editForm.title.trim() || !editForm.description.trim()}
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">Titel</label>
            <input className="form-input" value={editForm.title} onChange={(e)=>setEditForm(v=>({...v,title:e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Beskrivelse</label>
            <textarea className="form-input" rows={4} value={editForm.description} onChange={(e)=>setEditForm(v=>({...v,description:e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-input" value={editForm.status} onChange={(e)=>setEditForm(v=>({...v,status:e.target.value as Feature['status']}))}>
              <option value="pending">Afventer</option>
              <option value="approved">Godkendt</option>
              <option value="in_development">Under udvikling</option>
              <option value="completed">Færdig</option>
              <option value="rejected">Afvist</option>
            </select>
          </div>
        </div>
      </FormModal>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={deleteFeatureSubmit}
        title="Slet feature?"
        message={`Er du sikker på at du vil slette "${selected?.title}"? Dette kan ikke fortrydes.`}
        loading={submitting}
      />

        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {filteredFeatures.length === 0 ? (
          <div className="text-center py-12">
            <LightBulbIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen features fundet</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Prøv at justere dine filtre'
                : 'Foreslå din første feature for at komme i gang'
              }
            </p>
          </div>
        ) : (
          filteredFeatures.map((feature) => (
            <div key={feature.id} className="card card-hover">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {feature.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(feature.status)}
                        <button
                          onClick={() => handleVote(feature.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                        >
                          <HandThumbUpIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{feature.votes}</span>
                        </button>
                        <button
                          onClick={() => { setSelected(feature); setEditForm({ title: feature.title, description: feature.description, status: feature.status }); setShowEdit(true) }}
                          className="text-gray-500 hover:text-gray-700 p-1"
                          title="Rediger"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => { setSelected(feature); setShowDelete(true) }}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Slet"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Foreslået {new Date(feature.created_at).toLocaleDateString('da-DK')}
                      </span>
                      <button
                        onClick={() => toast.success('Åbner feature detaljer')}
                        className="text-blue-600 hover:text-blue-500 font-medium"
                      >
                        Se detaljer →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
