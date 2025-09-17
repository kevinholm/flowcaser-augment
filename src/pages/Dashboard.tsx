import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BugAntIcon,
  LightBulbIcon,
  ClockIcon,
  BookOpenIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'
import type {
  Bug,
  FeatureRequest,
  KnowledgeCase,
  TimeLog
} from '../lib/database.types'

interface DashboardStats {
  totalBugs: number
  openBugs: number
  closedBugs: number
  totalFeatures: number
  pendingFeatures: number
  totalKnowledge: number
  totalTimeThisWeek: number
  bugsTrend: number
  featuresTrend: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const { user } = useAuthStore()

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Get user's team
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('team_id')
        .eq('id', user!.id)
        .single()

      if (profileError) throw profileError
      const teamId = profile?.team_id

      if (!teamId) {
        setStats({
          totalBugs: 0,
          openBugs: 0,
          closedBugs: 0,
          totalFeatures: 0,
          pendingFeatures: 0,
          totalKnowledge: 0,
          totalTimeThisWeek: 0,
          bugsTrend: 0,
          featuresTrend: 0
        })
        setLoading(false)
        return
      }

      // Fetch all data in parallel
      const [bugsResult, featuresResult, knowledgeResult, timeLogsResult] = await Promise.all([
        supabase.from('bugs').select('*').eq('team_id', teamId).order('created_at', { ascending: false }),
        supabase.from('feature_requests').select('*').eq('team_id', teamId).order('created_at', { ascending: false }),
        supabase.from('knowledge_cases').select('*').eq('team_id', teamId).order('created_at', { ascending: false }),
        supabase.from('time_logs').select('*').eq('team_id', teamId).order('created_at', { ascending: false })
      ])

      const bugs = bugsResult.data || []
      const features = featuresResult.data || []
      const knowledge = knowledgeResult.data || []
      const timeLogs = timeLogsResult.data || []

      // Calculate weekly hours
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const weeklyLogs = timeLogs.filter(log => 
        new Date(log.created_at) >= oneWeekAgo
      )

      setStats({
        totalBugs: bugs.length,
        openBugs: bugs.filter(bug => bug.status !== 'resolved').length,
        closedBugs: bugs.filter(bug => bug.status === 'resolved').length,
        totalFeatures: features.length,
        pendingFeatures: features.filter(feature => feature.status === 'pending').length,
        totalKnowledge: knowledge.length,
        totalTimeThisWeek: weeklyLogs.reduce((sum, log) => sum + (log.hours || 0), 0),
        bugsTrend: 5,
        featuresTrend: 12
      })

      // Combine recent activity
      const activity = [
        ...bugs.slice(0, 3).map(bug => ({ ...bug, type: 'bug' })),
        ...features.slice(0, 3).map(feature => ({ ...feature, type: 'feature' })),
        ...timeLogs.slice(0, 3).map(log => ({ ...log, type: 'time' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5)

      setRecentActivity(activity)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Oversigt</h1>
            <p className="mt-1 text-sm text-gray-500">
              Velkommen tilbage! Her er et overblik over din FlowCaser aktivitet.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Bugs Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <BugAntIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Åbne Fejl</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.openBugs || 0}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-red-600">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +{stats?.bugsTrend || 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Features Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LightBulbIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Ønsker</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalFeatures || 0}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-green-600">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +{stats?.featuresTrend || 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Time Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Timer denne uge</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalTimeThisWeek || 0}t</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-green-600">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +12%
                </div>
              </div>
            </div>
          </div>

          {/* Knowledge Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Viden Cases</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalKnowledge || 0}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-purple-600">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  +8%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seneste Aktivitet</h3>
          {recentActivity.length === 0 ? (
            <p className="text-gray-500">Ingen aktivitet endnu</p>
          ) : (
            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'bug' && <BugAntIcon className="h-5 w-5 text-red-500" />}
                    {activity.type === 'feature' && <LightBulbIcon className="h-5 w-5 text-yellow-500" />}
                    {activity.type === 'time' && <ClockIcon className="h-5 w-5 text-green-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title || activity.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(activity.created_at).toLocaleDateString('da-DK')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
