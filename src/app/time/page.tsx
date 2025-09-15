'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createSupabaseClient } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout'
import Link from 'next/link'
import {
  PlusIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { da } from 'date-fns/locale'

interface TimeLog {
  id: string
  description: string
  hours: number
  date: string
  project: string | null
  team_id: string
  user_id: string
  created_at: string
  updated_at: string
  user?: {
    full_name: string | null
    email: string
  }
}

export default function TimePage() {
  const { user, profile } = useAuth()
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedUser, setSelectedUser] = useState('')
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.team_id) return

      try {
        // Fetch team members
        const { data: membersData } = await supabase
          .from('users')
          .select('id, full_name, email')
          .eq('team_id', profile.team_id)

        setTeamMembers(membersData || [])

        // Calculate date range
        const now = new Date()
        let startDate: Date
        let endDate: Date

        switch (selectedPeriod) {
          case 'week':
            startDate = startOfWeek(now, { weekStartsOn: 1 })
            endDate = endOfWeek(now, { weekStartsOn: 1 })
            break
          case 'month':
            startDate = startOfMonth(now)
            endDate = endOfMonth(now)
            break
          default:
            startDate = new Date(now.getFullYear(), 0, 1)
            endDate = new Date(now.getFullYear(), 11, 31)
        }

        // Fetch time logs
        let query = supabase
          .from('time_logs')
          .select(`
            *,
            user:users!time_logs_user_id_fkey(full_name, email)
          `)
          .eq('team_id', profile.team_id)
          .gte('date', format(startDate, 'yyyy-MM-dd'))
          .lte('date', format(endDate, 'yyyy-MM-dd'))
          .order('date', { ascending: false })

        if (selectedUser) {
          query = query.eq('user_id', selectedUser)
        }

        const { data, error } = await query

        if (error) throw error

        setTimeLogs(data || [])
      } catch (error) {
        console.error('Error fetching time logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [profile?.team_id, selectedPeriod, selectedUser, supabase])

  const totalHours = timeLogs.reduce((sum, log) => sum + log.hours, 0)
  const userHours = timeLogs
    .filter(log => log.user_id === user?.id)
    .reduce((sum, log) => sum + log.hours, 0)

  const projectHours = timeLogs.reduce((acc, log) => {
    const project = log.project || 'Uden projekt'
    acc[project] = (acc[project] || 0) + log.hours
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="spinner"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tidsregistrering</h1>
            <p className="mt-1 text-sm text-gray-500">
              Registrer og følg teamets tidsforbrug
            </p>
          </div>
          <Link
            href="/time/new"
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Log Tid
          </Link>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Periode
              </label>
              <select
                className="select-field"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="week">Denne uge</option>
                <option value="month">Denne måned</option>
                <option value="year">Dette år</option>
              </select>
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bruger
              </label>
              <select
                className="select-field"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Alle brugere</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.full_name || member.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-blue-100">
                  <ClockIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Timer
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalHours.toFixed(1)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-green-100">
                  <UserIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Dine Timer
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {userHours.toFixed(1)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg bg-purple-100">
                  <ChartBarIcon className="h-6 w-6 text-purple-600" />
                </div>
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

        {/* Project Breakdown */}
        {Object.keys(projectHours).length > 0 && (
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timer per Projekt</h3>
            <div className="space-y-3">
              {Object.entries(projectHours)
                .sort(([,a], [,b]) => b - a)
                .map(([project, hours]) => (
                  <div key={project} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{project}</span>
                    <span className="text-sm text-gray-500">{hours.toFixed(1)} timer</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Time Logs List */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tidsregistreringer</h3>
          
          {timeLogs.length === 0 ? (
            <div className="text-center py-8">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Ingen tidsregistreringer</h3>
              <p className="mt-1 text-sm text-gray-500">
                Ingen timer registreret i den valgte periode.
              </p>
              <div className="mt-6">
                <Link href="/time/new" className="btn-primary">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Log Tid
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {timeLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-1">
                      <span className="font-medium text-gray-900">{log.description}</span>
                      {log.project && (
                        <span className="badge badge-primary text-xs">{log.project}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-1" />
                        {log.user?.full_name || log.user?.email}
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {format(new Date(log.date), 'dd MMM yyyy', { locale: da })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {log.hours} timer
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
