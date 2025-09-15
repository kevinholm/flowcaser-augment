'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createSupabaseClient } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { SkeletonDashboard } from '@/components/common/SkeletonLoaders'
import Button from '@/components/common/Button'
import Badge, { StatusBadge, PriorityBadge } from '@/components/common/Badge'
import {
  BugAntIcon,
  LightBulbIcon,
  BookOpenIcon,
  ClockIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalBugs: number
  openBugs: number
  resolvedBugs: number
  totalFeatures: number
  pendingFeatures: number
  approvedFeatures: number
  totalKnowledge: number
  totalTimeLogged: number
  teamMembers: number
  activeProjects: number
}

interface RecentActivity {
  id: string
  type: 'bug' | 'feature' | 'knowledge' | 'time'
  title: string
  description: string
  user: string
  timestamp: string
  status?: string
  priority?: string
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalBugs: 0,
    openBugs: 0,
    resolvedBugs: 0,
    totalFeatures: 0,
    pendingFeatures: 0,
    approvedFeatures: 0,
    totalKnowledge: 0,
    totalTimeLogged: 0,
    teamMembers: 0,
    activeProjects: 0,
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile?.team_id) return

      try {
        // Fetch bugs stats
        const { data: bugsData } = await supabase
          .from('bugs')
          .select('status')
          .eq('team_id', profile.team_id)

        const totalBugs = bugsData?.length || 0
        const openBugs = bugsData?.filter(bug => bug.status === 'open').length || 0
        const resolvedBugs = bugsData?.filter(bug => bug.status === 'resolved').length || 0

        // Fetch features stats
        const { data: featuresData } = await supabase
          .from('feature_requests')
          .select('status')
          .eq('team_id', profile.team_id)

        const totalFeatures = featuresData?.length || 0
        const pendingFeatures = featuresData?.filter(feature => feature.status === 'pending').length || 0
        const approvedFeatures = featuresData?.filter(feature => feature.status === 'approved').length || 0

        // Fetch knowledge stats
        const { data: knowledgeData } = await supabase
          .from('knowledge_cases')
          .select('id')
          .eq('team_id', profile.team_id)

        const totalKnowledge = knowledgeData?.length || 0

        // Fetch time logs stats
        const { data: timeData } = await supabase
          .from('time_logs')
          .select('hours')
          .eq('team_id', profile.team_id)

        const totalTimeLogged = timeData?.reduce((sum, log) => sum + log.hours, 0) || 0

        // Fetch team members count
        const { data: membersData } = await supabase
          .from('users')
          .select('id')
          .eq('team_id', profile.team_id)

        const teamMembers = membersData?.length || 0

        setStats({
          totalBugs,
          openBugs,
          resolvedBugs,
          totalFeatures,
          pendingFeatures,
          approvedFeatures,
          totalKnowledge,
          totalTimeLogged,
          teamMembers,
          activeProjects: 3, // Mock data for now
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [profile?.team_id, supabase])

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!profile?.team_id) return

      try {
        // Mock recent activity data for now
        const mockActivity: RecentActivity[] = [
          {
            id: '1',
            type: 'bug',
            title: 'Login fejl på mobile enheder',
            description: 'Brugere kan ikke logge ind på mobile enheder',
            user: 'Anna Nielsen',
            timestamp: '2 timer siden',
            status: 'open',
            priority: 'high'
          },
          {
            id: '2',
            type: 'feature',
            title: 'Dark mode support',
            description: 'Tilføj dark mode til applikationen',
            user: 'Peter Hansen',
            timestamp: '4 timer siden',
            status: 'approved'
          },
          {
            id: '3',
            type: 'knowledge',
            title: 'API Integration Guide',
            description: 'Guide til integration med eksterne APIs',
            user: 'Maria Larsen',
            timestamp: '1 dag siden'
          },
          {
            id: '4',
            type: 'time',
            title: 'Bug fixes',
            description: '3.5 timer logget på bug fixes',
            user: 'Lars Andersen',
            timestamp: '2 dage siden'
          }
        ]

        setRecentActivity(mockActivity)
      } catch (error) {
        console.error('Error fetching recent activity:', error)
      } finally {
        setActivityLoading(false)
      }
    }

    fetchRecentActivity()
  }, [profile?.team_id])

  const statCards = [
    {
      name: 'Åbne Bugs',
      value: stats.openBugs,
      total: stats.totalBugs,
      icon: BugAntIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: stats.resolvedBugs > stats.openBugs ? 'up' : 'down',
      trendValue: `${stats.resolvedBugs} løst`,
      href: '/bugs'
    },
    {
      name: 'Ventende Features',
      value: stats.pendingFeatures,
      total: stats.totalFeatures,
      icon: LightBulbIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      trend: 'neutral',
      trendValue: `${stats.approvedFeatures} godkendt`,
      href: '/features'
    },
    {
      name: 'Videns Cases',
      value: stats.totalKnowledge,
      total: null,
      icon: BookOpenIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: 'up',
      trendValue: '+2 denne uge',
      href: '/knowledge'
    },
    {
      name: 'Timer Logget',
      value: Math.round(stats.totalTimeLogged * 10) / 10,
      total: null,
      icon: ClockIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: 'up',
      trendValue: '42.5t denne uge',
      href: '/time'
    },
    {
      name: 'Team Medlemmer',
      value: stats.teamMembers,
      total: null,
      icon: UserGroupIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: 'neutral',
      trendValue: 'Aktive',
      href: '/settings'
    },
    {
      name: 'Aktive Projekter',
      value: stats.activeProjects,
      total: null,
      icon: ChartBarIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      trend: 'up',
      trendValue: 'I gang',
      href: '/dashboard'
    },
  ]

  if (loading) {
    return (
      <AppLayout>
        <SkeletonDashboard />
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Velkommen tilbage, {profile?.full_name || user?.email}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Her er en oversigt over dit teams aktivitet
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((stat) => (
            <a
              key={stat.name}
              href={stat.href}
              className="card-hover group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        {stat.total !== null && (
                          <div className="ml-2 text-sm text-gray-500">
                            af {stat.total}
                          </div>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {stat.trend === 'up' && (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  )}
                  {stat.trend === 'down' && (
                    <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                  )}
                  {stat.trend === 'neutral' && (
                    <CheckCircleIcon className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-500 mt-1">
                    {stat.trendValue}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Hurtige Handlinger</h3>
            <Badge variant="info" size="sm">Genveje</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button
              href="/bugs/new"
              variant="secondary"
              size="lg"
              icon={<BugAntIcon className="h-5 w-5" />}
              className="justify-start h-auto p-4 flex-col items-start space-y-2"
            >
              <div className="flex items-center w-full">
                <BugAntIcon className="h-5 w-5 mr-2 text-red-500" />
                <span className="font-medium">Rapporter Bug</span>
              </div>
              <span className="text-xs text-gray-500 text-left">
                Opret en ny bug rapport
              </span>
            </Button>

            <Button
              href="/features/new"
              variant="secondary"
              size="lg"
              icon={<LightBulbIcon className="h-5 w-5" />}
              className="justify-start h-auto p-4 flex-col items-start space-y-2"
            >
              <div className="flex items-center w-full">
                <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
                <span className="font-medium">Foreslå Feature</span>
              </div>
              <span className="text-xs text-gray-500 text-left">
                Indsend en feature anmodning
              </span>
            </Button>

            <Button
              href="/knowledge/new"
              variant="secondary"
              size="lg"
              icon={<BookOpenIcon className="h-5 w-5" />}
              className="justify-start h-auto p-4 flex-col items-start space-y-2"
            >
              <div className="flex items-center w-full">
                <BookOpenIcon className="h-5 w-5 mr-2 text-blue-500" />
                <span className="font-medium">Tilføj Viden</span>
              </div>
              <span className="text-xs text-gray-500 text-left">
                Del viden med teamet
              </span>
            </Button>

            <Button
              href="/time/new"
              variant="secondary"
              size="lg"
              icon={<ClockIcon className="h-5 w-5" />}
              className="justify-start h-auto p-4 flex-col items-start space-y-2"
            >
              <div className="flex items-center w-full">
                <ClockIcon className="h-5 w-5 mr-2 text-green-500" />
                <span className="font-medium">Log Tid</span>
              </div>
              <span className="text-xs text-gray-500 text-left">
                Registrer arbejdstid
              </span>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Seneste Aktivitet</h3>
            <Button
              href="/activity"
              variant="ghost"
              size="sm"
            >
              Se alle
            </Button>
          </div>

          {activityLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-500">
                Ingen aktivitet endnu. Start med at oprette din første bug, feature eller videns case!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'bug' ? 'bg-red-100' :
                      activity.type === 'feature' ? 'bg-yellow-100' :
                      activity.type === 'knowledge' ? 'bg-blue-100' :
                      'bg-green-100'
                    }`}>
                      {activity.type === 'bug' && <BugAntIcon className="h-5 w-5 text-red-600" />}
                      {activity.type === 'feature' && <LightBulbIcon className="h-5 w-5 text-yellow-600" />}
                      {activity.type === 'knowledge' && <BookOpenIcon className="h-5 w-5 text-blue-600" />}
                      {activity.type === 'time' && <ClockIcon className="h-5 w-5 text-green-600" />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {activity.status && (
                          <StatusBadge status={activity.status as any} />
                        )}
                        {activity.priority && (
                          <PriorityBadge priority={activity.priority as any} />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        af {activity.user}
                      </span>
                      <span className="text-xs text-gray-500">
                        {activity.timestamp}
                      </span>
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
