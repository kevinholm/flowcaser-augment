import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  BugAntIcon,
  LightBulbIcon,
  ClockIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import LoadingSpinner from '../components/common/LoadingSpinner'

interface DashboardStats {
  totalBugs: number
  openBugs: number
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

      // Fetch stats in parallel
      const [
        bugsResult,
        featuresResult,
        knowledgeResult,
        timeLogsResult
      ] = await Promise.all([
        supabase.from('bugs').select('id, status, created_at'),
        supabase.from('feature_requests').select('id, status, created_at'),
        supabase.from('knowledge_cases').select('id'),
        supabase.from('time_logs').select('hours, date').gte('date', getWeekStart())
      ])

      const bugs = bugsResult.data || []
      const features = featuresResult.data || []
      const knowledge = knowledgeResult.data || []
      const timeLogs = timeLogsResult.data || []

      // Calculate trends (mock data for demo)
      const bugsTrend = Math.floor(Math.random() * 20) - 10
      const featuresTrend = Math.floor(Math.random() * 20) - 10

      setStats({
        totalBugs: bugs.length,
        openBugs: bugs.filter(b => b.status === 'open' || b.status === 'in_progress').length,
        totalFeatures: features.length,
        pendingFeatures: features.filter(f => f.status === 'pending').length,
        totalKnowledge: knowledge.length,
        totalTimeThisWeek: timeLogs.reduce((sum, log) => sum + (log.hours || 0), 0),
        bugsTrend,
        featuresTrend
      })

      // Generate recent activity (mock data for demo)
      setRecentActivity([
        {
          id: 1,
          type: 'bug',
          title: 'Login fejl på mobil',
          action: 'oprettet',
          time: '2 timer siden',
          user: 'Anders Nielsen'
        },
        {
          id: 2,
          type: 'feature',
          title: 'Dark mode support',
          action: 'godkendt',
          time: '4 timer siden',
          user: 'Maria Hansen'
        },
        {
          id: 3,
          type: 'knowledge',
          title: 'API dokumentation opdateret',
          action: 'opdateret',
          time: '6 timer siden',
          user: 'Lars Andersen'
        },
        {
          id: 4,
          type: 'time',
          title: '8 timer registreret på Projekt Alpha',
          action: 'registreret',
          time: '1 dag siden',
          user: 'Du'
        }
      ])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeekStart = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
    return new Date(now.setDate(diff)).toISOString().split('T')[0]
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return <BugAntIcon className="h-5 w-5 text-red-500" />
      case 'feature':
        return <LightBulbIcon className="h-5 w-5 text-yellow-500" />
      case 'knowledge':
        return <BookOpenIcon className="h-5 w-5 text-blue-500" />
      case 'time':
        return <ClockIcon className="h-5 w-5 text-green-500" />
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-500" />
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Oversigt</h1>
        <p className="mt-1 text-sm text-gray-500">
          Velkommen tilbage! Her er et overblik over din FlowCaser aktivitet.
        </p>
      </div>

      {/* Oversigt kort som i mockup */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Åbne fejl */}
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-gray-500">Åbne fejl</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.openBugs}</div>
          </div>
        </div>
        {/* MTR */}
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-gray-500">MTR</div>
            <div className="mt-1 text-sm text-gray-500">Data ikke tilgængelig</div>
          </div>
        </div>
        {/* Viden cases */}
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-gray-500">Viden cases</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">{stats.totalKnowledge}</div>
          </div>
        </div>
        {/* Test fejl */}
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-gray-500">Test fejl</div>
            <div className="mt-1 text-2xl font-semibold text-gray-900">0</div>
          </div>
        </div>
      </div>

      {/* Ny viden & Seneste fejl */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Ny viden</h3>
          </div>
          <div className="card-body">
            {knowledge.length === 0 ? (
              <div className="text-sm text-gray-500">Ingen viden endnu</div>
            ) : (
              <ul className="space-y-3">
                {knowledge.slice(0, 5).map((k) => (
                  <li key={k.id} className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{k.title}</div>
                    <div className="text-xs text-gray-500">{new Date(k.created_at).toLocaleDateString('da-DK')}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">Seneste fejl</h3>
          </div>
          <div className="card-body">
            {bugs.length === 0 ? (
              <div className="text-sm text-gray-500">Ingen fejl endnu</div>
            ) : (
              <ul className="space-y-3">
                {bugs.slice(0, 5).map((b) => (
                  <li key={b.id} className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{b.title}</div>
                    <span className={`badge ${b.status === 'open' ? 'badge-danger' : 'badge-success'}`}>
                      {b.status === 'open' ? 'Åben' : 'Lukket'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Statistik & Aktivitet */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-medium text-gray-900">Vidensbase Statistik</h3>
          </div>
          <div className="card-body text-sm text-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span>Artikler</span>
              <span className="font-medium text-gray-900">{stats.totalKnowledge}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Seneste 30 dage</span>
              <span className="text-gray-500">{knowledge.filter(k => new Date(k.created_at) > new Date(Date.now()-30*864e5)).length}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-medium text-gray-900">Fejl Performance</h3>
          </div>
          <div className="card-body text-sm text-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span>Åbne</span>
              <span className="font-medium text-gray-900">{stats.openBugs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Lukket</span>
              <span className="text-gray-500">{stats.closedBugs}</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-medium text-gray-900">Chat Aktivitet</h3>
          </div>
          <div className="card-body text-sm text-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span>Beskeder (seneste 24t)</span>
              <span className="font-medium text-gray-900">{chatMessages.length}</span>
            </div>
            <div className="text-xs text-gray-500">AI kan svare på tværs af bugs, features, viden og tid</div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="text-sm font-medium text-gray-900">Feature Ønsker</h3>
          </div>
          <div className="card-body text-sm text-gray-600">
            <div className="flex items-center justify-between mb-2">
              <span>Total</span>
              <span className="font-medium text-gray-900">{features.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Under udvikling</span>
              <span className="text-gray-500">{features.filter(f => f.status === 'in_development').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Bugs */}
        <div className="card card-hover">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BugAntIcon className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Bugs
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats?.openBugs}/{stats?.totalBugs}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      (stats?.bugsTrend || 0) >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {(stats?.bugsTrend || 0) >= 0 ? (
                        <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                      ) : (
                        <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {(stats?.bugsTrend || 0) >= 0 ? 'Stigning' : 'Fald'}
                      </span>
                      {Math.abs(stats?.bugsTrend || 0)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <Link
                to="/bugs"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Se alle bugs →
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card card-hover">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LightBulbIcon className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Features
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats?.pendingFeatures}/{stats?.totalFeatures}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      (stats?.featuresTrend || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {(stats?.featuresTrend || 0) >= 0 ? (
                        <ArrowTrendingUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                      ) : (
                        <ArrowTrendingDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {(stats?.featuresTrend || 0) >= 0 ? 'Stigning' : 'Fald'}
                      </span>
                      {Math.abs(stats?.featuresTrend || 0)}%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <Link
                to="/features"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Se alle features →
              </Link>
            </div>
          </div>
        </div>

        {/* Knowledge */}
        <div className="card card-hover">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpenIcon className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Viden
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats?.totalKnowledge}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <Link
                to="/knowledge"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Udforsk viden →
              </Link>
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="card card-hover">
          <div className="card-body">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Timer denne uge
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats?.totalTimeThisWeek || 0}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-3">
              <Link
                to="/time"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Registrer tid →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Hurtige handlinger</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/bugs"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">Rapporter bug</span>
            </Link>
            <Link
              to="/features"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">Foreslå feature</span>
            </Link>
            <Link
              to="/knowledge"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">Tilføj viden</span>
            </Link>
            <Link
              to="/time"
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">Registrer tid</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Seneste aktivitet</h3>
        </div>
        <div className="card-body">
          <div className="flow-root">
            <ul className="-mb-8">
              {recentActivity.map((activity, activityIdx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {activityIdx !== recentActivity.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                          {getActivityIcon(activity.type)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">{activity.title}</span>{' '}
                            {activity.action} af {activity.user}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time>{activity.time}</time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
