import { useState, useEffect } from 'react'
import { ClockIcon, PlusIcon, CalendarIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'
import SmartTimeModal from '../components/time/SmartTimeModal'
import toast from 'react-hot-toast'
import { FormModal, ConfirmModal } from '../components/common/Modal'
import type { TimeLog, TimeLogInsert, TimeLogUpdate } from '../lib/database.types'

export default function Time() {
  const { user } = useAuthStore()
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showSmartModal, setShowSmartModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selected, setSelected] = useState<TimeLog | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const init = async () => {
      if (!user) return
      await fetchTimeLogs()
    }
    init()
  }, [user])

  const fetchTimeLogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('time_logs')
        .select('*')
        .eq('team_id', user?.team_id)
        .order('date', { ascending: false })

      if (error) throw error
      setTimeLogs(data || [])
    } catch (error: any) {
      console.error('Error fetching time logs:', error)
      toast.error('Kunne ikke hente tidsregistreringer')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTimeLog = async (timeLogData: any) => {
    try {
      setSubmitting(true)
      const { error } = await supabase
        .from('time_logs')
        .insert({
          ...timeLogData,
          team_id: user?.team_id,
          user_id: user?.id
        })

      if (error) throw error
      toast.success('Tidsregistrering gemt!')
      await fetchTimeLogs()
    } catch (error: any) {
      console.error('Error saving time log:', error)
      toast.error('Fejl ved gemning af tidsregistrering')
    } finally {
      setSubmitting(false)
    }
  }

  const createTimeSubmit = async () => {
    if (!user || !teamId) { toast.error('Kraever bruger og team'); return }
    if (!createForm.description.trim() || !createForm.project.trim() || createForm.hours <= 0) {
      toast.error('Udfyld beskrivelse, projekt og antal timer > 0');
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('time_logs').insert({
        description: createForm.description.trim(),
        project: createForm.project.trim(),
        hours: createForm.hours,
        date: createForm.date,
        team_id: teamId,
        created_by: user.id,
      })
      if (error) throw error
      toast.success('Tid registreret')
      setShowCreateModal(false)
      resetForms()
      await fetchTimeLogs(teamId)
    } catch (e) {
      console.error(e)
      toast.error('Kunne ikke registrere tid')
    } finally {
      setSubmitting(false)
    }
  }

  const updateTimeSubmit = async () => {
    if (!selected) return
    if (!editForm.description.trim() || !editForm.project.trim() || editForm.hours <= 0) {
      toast.error('Udfyld beskrivelse, projekt og antal timer > 0');
      return
    }
    setSubmitting(true)
    try {
      const { error } = await supabase.from('time_logs').update({
        description: editForm.description.trim(),
        project: editForm.project.trim(),
        hours: editForm.hours,
        date: editForm.date,
      }).eq('id', selected.id)
      if (error) throw error
      toast.success('Registrering opdateret')
      setShowEditModal(false)
      setSelected(null)
      resetForms()
      await fetchTimeLogs(teamId)
    } catch (e) {
      console.error(e)
      toast.error('Kunne ikke opdatere registrering')
    } finally {
      setSubmitting(false)
    }
  }

  const deleteTimeSubmit = async () => {
    if (!selected) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('time_logs').delete().eq('id', selected.id)
      if (error) throw error
      toast.success('Registrering slettet')
      setShowDeleteModal(false)
      setSelected(null)
      await fetchTimeLogs(teamId)
    } catch (e) {
      console.error(e)
      toast.error('Kunne ikke slette registrering')
    } finally {
      setSubmitting(false)
    }
  }


  const getTotalHours = () => {
    return timeLogs.reduce((sum, log) => sum + log.hours, 0)
  }

  const getWeeklyHours = () => {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    weekStart.setHours(0, 0, 0, 0)

    return timeLogs
      .filter(log => new Date(log.date) >= weekStart)
      .reduce((sum, log) => sum + log.hours, 0)
  }

  const getProjectHours = () => {
    const projects: Record<string, number> = {}
    timeLogs.forEach(log => {
      projects[log.project] = (projects[log.project] || 0) + log.hours
    })
    return projects
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const projectHours = getProjectHours()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ClockIcon className="h-8 w-8 text-green-500 mr-3" />
            Tidsregistrering
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Registrer og spor din arbejdstid
          </p>
        </div>
        <button
          onClick={() => setShowSmartModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Smart Tidsregistrering
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total timer
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {getTotalHours()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Denne uge
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {getWeeklyHours()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Projekter
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {Object.keys(projectHours).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Hours */}
      {Object.keys(projectHours).length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Timer per projekt</h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {Object.entries(projectHours)
                .sort(([,a], [,b]) => b - a)
                .map(([project, hours]) => (
                <div key={project} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{project}</span>
                  <span className="text-sm text-gray-500">{hours} timer</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Time Logs */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Seneste registreringer ({timeLogs.length})
          </h3>
        </div>
        <div className="card-body p-0">
          {timeLogs.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ingen tidsregistreringer</h3>
              <p className="text-gray-500 mb-4">
                Registrer din første arbejdstid for at komme i gang
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Registrer Tid
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Beskrivelse</th>
                    <th className="table-header">Projekt</th>
                    <th className="table-header">Timer</th>
                    <th className="table-header">Dato</th>
                    <th className="table-header">Handlinger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {timeLogs.map((log) => (
                    <tr key={log.id} className="table-row">
                      <td className="table-cell">
                        <div className="text-sm font-medium text-gray-900">
                          {log.description}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="badge badge-secondary">
                          {log.project}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {log.hours} timer
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-gray-900">
                          {new Date(log.date).toLocaleDateString('da-DK')}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-3">
                          <button onClick={() => { setSelected(log); setEditForm({ description: log.description, project: log.project, hours: log.hours, date: log.date.slice(0,10) }); setShowEditModal(true) }}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center">
                            <PencilSquareIcon className="h-4 w-4 mr-1" /> Rediger
                          </button>
                          <button onClick={() => { setSelected(log); setShowDeleteModal(true) }}
                            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center">
                            <TrashIcon className="h-4 w-4 mr-1" /> Slet
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Time Log Modal */}
      <FormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Registrer tid"
        onSubmit={createTimeSubmit}
        loading={submitting}
        submitDisabled={!createForm.description.trim() || !createForm.project.trim() || createForm.hours <= 0}
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">Beskrivelse</label>
            <input className="form-input" value={createForm.description} onChange={(e)=>setCreateForm(v=>({...v,description:e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Projekt</label>
            <input className="form-input" value={createForm.project} onChange={(e)=>setCreateForm(v=>({...v,project:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Timer</label>
              <input type="number" min={0} step={0.25} className="form-input" value={createForm.hours} onChange={(e)=>setCreateForm(v=>({...v,hours: Number(e.target.value)}))} />
            </div>
            <div>
              <label className="form-label">Dato</label>
              <input type="date" className="form-input" value={createForm.date} onChange={(e)=>setCreateForm(v=>({...v,date:e.target.value}))} />
            </div>
          </div>
        </div>
      </FormModal>

      {/* Edit Time Log Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelected(null) }}
        title="Rediger registrering"
        onSubmit={updateTimeSubmit}
        loading={submitting}
        submitDisabled={!editForm.description.trim() || !editForm.project.trim() || editForm.hours <= 0}
      >
        <div className="space-y-4">
          <div>
            <label className="form-label">Beskrivelse</label>
            <input className="form-input" value={editForm.description} onChange={(e)=>setEditForm(v=>({...v,description:e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Projekt</label>
            <input className="form-input" value={editForm.project} onChange={(e)=>setEditForm(v=>({...v,project:e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Timer</label>
              <input type="number" min={0} step={0.25} className="form-input" value={editForm.hours} onChange={(e)=>setEditForm(v=>({...v,hours: Number(e.target.value)}))} />
            </div>
            <div>
              <label className="form-label">Dato</label>
              <input type="date" className="form-input" value={editForm.date} onChange={(e)=>setEditForm(v=>({...v,date:e.target.value}))} />
            </div>
          </div>
        </div>
      </FormModal>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteTimeSubmit}
        title="Slet registrering?"
        message={`Er du sikker p\u00e5 at du vil slette \"${selected?.description}\"? Dette kan ikke fortrydes.`}
        loading={submitting}
      />

      {/* Smart Time Modal */}
      <SmartTimeModal
        isOpen={showSmartModal}
        onClose={() => setShowSmartModal(false)}
        onSave={handleSaveTimeLog}
      />
    </div>
  )
}
