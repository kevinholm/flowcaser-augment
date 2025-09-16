import { useState, useEffect } from 'react'
import { BookOpenIcon, PlusIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'
import { FormModal, ConfirmModal } from '../components/common/Modal'
import type { KnowledgeCase, KnowledgeCaseInsert, KnowledgeCaseUpdate } from '../lib/database.types'

export default function Knowledge() {
  const [cases, setCases] = useState<KnowledgeCase[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [teamId, setTeamId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [selected, setSelected] = useState<KnowledgeCase | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [createForm, setCreateForm] = useState<Pick<KnowledgeCaseInsert, 'title' | 'content' | 'category'>>({
    title: '',
    content: '',
    category: ''
  })
  const [editForm, setEditForm] = useState<Pick<KnowledgeCaseUpdate, 'title' | 'content' | 'category'>>({
    title: '',
    content: '',
    category: ''
  })

  const { user } = useAuthStore()

  useEffect(() => {
    const init = async () => {
      if (!user) return
      const { data: profile } = await supabase.from('users').select('team_id').eq('id', user.id).single()
      setTeamId(profile?.team_id || null)
      await fetchKnowledgeCases(profile?.team_id || null)
    }
    init()
  }, [user])

  const fetchKnowledgeCases = async (team?: string | null) => {
    try {
      setLoading(true)
      let query = supabase
        .from('knowledge_cases')
        .select('*')
        .order('created_at', { ascending: false })
      if (team) query = query.eq('team_id', team)

      const { data, error } = await query
      if (error) throw error
      setCases(data || [])
    } catch (error: any) {
      console.error('Error fetching knowledge cases:', error)
      toast.error('Kunne ikke hente videns cases')
    } finally {
      setLoading(false)
    }
  }
  const resetForms = () => {
    setCreateForm({ title: '', content: '', category: '' })
    setEditForm({ title: '', content: '', category: '' })
  }

  const createKnowledgeSubmit = async () => {
    if (!user || !teamId) { toast.error('Kraever bruger og team'); return }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('knowledge_cases').insert({
        title: createForm.title.trim(),
        content: createForm.content.trim(),
        category: createForm.category.trim() || null,
        team_id: teamId,
        created_by: user.id,
      })
      if (error) throw error
      toast.success('Viden oprettet')
      setShowCreate(false)
      resetForms()
      await fetchKnowledgeCases(teamId)
    } catch (e) {
      console.error(e)
      toast.error('Kunne ikke oprette viden')
    } finally {
      setSubmitting(false)
    }
  }

  const updateKnowledgeSubmit = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('knowledge_cases').update({
        title: editForm.title.trim(),
        content: editForm.content.trim(),
        category: editForm.category.trim() || null,
      }).eq('id', selected.id)
      if (error) throw error
      toast.success('Viden opdateret')
      setShowEdit(false)
      setSelected(null)
      resetForms()
      await fetchKnowledgeCases(teamId)
    } catch (e) {
      console.error(e)
      toast.error('Kunne ikke opdatere viden')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteKnowledgeSubmit = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('knowledge_cases').delete().eq('id', selected.id)
      if (error) throw error
      toast.success('Viden slettet')
      setShowDelete(false)
      setSelected(null)
      await fetchKnowledgeCases(teamId)
    } catch (e) {
      console.error(e)
      toast.error('Kunne ikke slette viden')
    } finally {
      setSubmitting(false)
    }
  }


  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || case_.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(cases.map(c => c.category))].filter(Boolean)

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
            <BookOpenIcon className="h-8 w-8 text-blue-500 mr-3" />
            Videns Base
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Del og find viden på tværs af teamet
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Tilføj Viden
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
                  placeholder="Søg i viden..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-input"
              >
                <option value="all">Alle kategorier</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('all')
                }}
                className="btn-secondary w-full"
              >
                Ryd filtre
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredCases.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen viden fundet</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || categoryFilter !== 'all'
                ? 'Prøv at justere dine filtre'
                : 'Tilføj din første videns artikel for at komme i gang'
              }
            </p>
          </div>
        ) : (
          filteredCases.map((case_) => (
            <div key={case_.id} className="card card-hover">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {case_.title}
                    </h3>
                    {case_.category && (
                      <span className="badge badge-secondary mb-3">
                        {case_.category}
                      </span>
                    )}
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {case_.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>
                        Oprettet {new Date(case_.created_at).toLocaleDateString('da-DK')}
                      </span>
                      <div className="flex items-center space-x-4">
                        <button onClick={() => toast.success('Åbner videns artikel')}
                          className="text-blue-600 hover:text-blue-500 font-medium">Læs mere →</button>
                        <button onClick={() => { setSelected(case_); setEditForm({ title: case_.title, content: case_.content, category: case_.category || '' }); setShowEdit(true) }}
                          className="text-gray-600 hover:text-gray-900 font-medium flex items-center">
                          <PencilSquareIcon className="h-4 w-4 mr-1"/> Rediger
                        </button>
                        <button onClick={() => { setSelected(case_); setShowDelete(true) }}
                          className="text-red-600 hover:text-red-700 font-medium flex items-center">
                          <TrashIcon className="h-4 w-4 mr-1"/> Slet
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Create Knowledge Modal */}
      <FormModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Tilføj viden"
        onSubmit={createKnowledgeSubmit}
        loading={submitting}
        submitDisabled={!createForm.title.trim() || !createForm.content.trim()}
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">Titel</label>
            <input className="form-input" value={createForm.title} onChange={(e)=>setCreateForm(v=>({...v,title:e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Kategori (valgfri)</label>
            <input className="form-input" value={createForm.category} onChange={(e)=>setCreateForm(v=>({...v,category:e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Indhold</label>
            <textarea className="form-input" rows={6} value={createForm.content} onChange={(e)=>setCreateForm(v=>({...v,content:e.target.value}))} />
          </div>
        </div>
      </FormModal>

      {/* Edit Knowledge Modal */}
      <FormModal
        isOpen={showEdit}
        onClose={() => { setShowEdit(false); setSelected(null) }}
        title="Rediger viden"
        onSubmit={updateKnowledgeSubmit}
        loading={submitting}
        submitDisabled={!editForm.title.trim() || !editForm.content.trim()}
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">Titel</label>
            <input className="form-input" value={editForm.title} onChange={(e)=>setEditForm(v=>({...v,title:e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Kategori (valgfri)</label>
            <input className="form-input" value={editForm.category} onChange={(e)=>setEditForm(v=>({...v,category:e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Indhold</label>
            <textarea className="form-input" rows={6} value={editForm.content} onChange={(e)=>setEditForm(v=>({...v,content:e.target.value}))} />
          </div>
        </div>
      </FormModal>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={deleteKnowledgeSubmit}
        title="Slet viden?"
        message={`Er du sikker på at du vil slette "${selected?.title}"? Dette kan ikke fortrydes.`}
        loading={submitting}
      />

    </div>
  )
}
