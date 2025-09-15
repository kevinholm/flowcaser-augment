import { useState, useEffect } from 'react'
import { ClockIcon, PlusIcon, CalendarIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

interface TimeLog {
  id: string
  description: string
  project: string
  hours: number
  date: string
  created_at: string
}

export default function Time() {
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      fetchTimeLogs()
    }
  }, [user])

  const fetchTimeLogs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('time_logs')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        throw error
      }

      setTimeLogs(data || [])
    } catch (error: any) {
      console.error('Error fetching time logs:', error)
      toast.error('Kunne ikke hente tidsregistreringer')
    } finally {
      setLoading(false)
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
          onClick={() => setShowCreateModal(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Registrer Tid
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Time Log Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Registrer Tid</h3>
            <p className="text-gray-500 mb-4">
              Tidsregistrering funktionalitet kommer snart!
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
              >
                Luk
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  toast.success('Tid registreret!')
                }}
                className="btn-primary"
              >
                Registrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
