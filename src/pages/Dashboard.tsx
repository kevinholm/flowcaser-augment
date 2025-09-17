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
import { FormModal, ConfirmModal } from '../components/common/Modal'
import toast from 'react-hot-toast'
import type {
  Bug,
  FeatureRequest,
  KnowledgeCase,
  TimeLog,
  BugInsert,
  FeatureRequestInsert,
  KnowledgeCaseInsert,
  TimeLogInsert
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
  const [recentActivity, setRecentActivity] = useState<(Bug | FeatureRequest | KnowledgeCase | TimeLog)[]>([])
  const { user } = useAuthStore()

  // Local data for sections
  const [bugs, setBugs] = useState<Bug[]>([])
  const [features, setFeatures] = useState<FeatureRequest[]>([])
  const [teamId, setTeamId] = useState<string | null>(null)

  // Quick action modals
  const [showBugModal, setShowBugModal] = useState(false)
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false)
  const [showTimeModal, setShowTimeModal] = useState(false)

  // Forms
  const [bugForm, setBugForm] = useState({ title: '', description: '', priority: 'medium' as 'low'|'medium'|'high'|'critical' })
  const [featureForm, setFeatureForm] = useState({ title: '', description: '', priority: 'medium' as 'low'|'medium'|'high' })
  const [knowledgeForm, setKnowledgeForm] = useState({ title: '', content: '', category: '' })
  const [timeForm, setTimeForm] = useState({ description: '', project: '', hours: 1, date: new Date().toISOString().slice(0,10) })
  const [submitting, setSubmitting] = useState(false)

  const [knowledge, setKnowledge] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])


  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Resolve current team id
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('team_id')
        .eq('id', user!.id)
        .single()

      if (profileError) throw profileError
      const teamId = profile?.team_id
      setTeamId(teamId)

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
          featuresTrend: 0,
        })
        setBugs([]); setFeatures([]); setKnowledge([]); setChatMessages([])
        return
      }

      const sinceWeek = getWeekStart()
      const since24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString()

      // Fetch data in parallel (scoped to team)
      const [bugsRes, featuresRes, knowledgeRes, timeLogsRes, chatRes] = await Promise.all([
        supabase.from('bugs').select('id, status, title, priority, created_at').eq('team_id', teamId),
        supabase.from('feature_requests').select('id, status, title, votes, created_at').eq('team_id', teamId),
        supabase.from('knowledge_cases').select('id, title, category, created_at').eq('team_id', teamId),
        supabase.from('time_logs').select('hours, date').eq('team_id', teamId).gte('date', sinceWeek),
        supabase.from('chat_messages').select('id, created_at').eq('team_id', teamId).gte('created_at', since24h),
      ])

      const bugsArr = bugsRes.data || []
      const featuresArr = featuresRes.data || []
      const knowledgeArr = knowledgeRes.data || []
      const timeLogsArr = timeLogsRes.data || []
      const chatArr = chatRes.data || []

      const openBugs = bugsArr.filter((b: any) => b.status === 'open' || b.status === 'in_progress').length
      const closedBugs = bugsArr.filter((b: any) => b.status === 'closed' || b.status === 'resolved').length
      const pendingFeatures = featuresArr.filter((f: any) => f.status === 'pending').length
      const totalTimeThisWeek = timeLogsArr.reduce((sum: number, log: any) => sum + (Number(log.hours) || 0), 0)

      // Keep simple mock trends for now
      const bugsTrend = Math.floor(Math.random() * 20) - 10
      const featuresTrend = Math.floor(Math.random() * 20) - 10

      setStats({
        totalBugs: bugsArr.length,
        openBugs,
        closedBugs,
        totalFeatures: featuresArr.length,
        pendingFeatures,
        totalKnowledge: knowledgeArr.length,
        totalTimeThisWeek,
        bugsTrend,
        featuresTrend,
      })

      setBugs(bugsArr)
      setFeatures(featuresArr)
      setKnowledge(knowledgeArr)
      setChatMessages(chatArr)

      // Recent activity (mock for now)
      setRecentActivity([
        { id: 1, type: 'bug', title: 'Login fejl på mobil', action: 'oprettet', time: '2 timer siden', user: 'Anders Nielsen' },
        { id: 2, type: 'feature', title: 'Dark mode support', action: 'godkendt', time: '4 timer siden', user: 'Maria Hansen' },
        { id: 3, type: 'knowledge', title: 'API dokumentation opdateret', action: 'opdateret', time: '6 timer siden', user: 'Lars Andersen' },
        { id: 4, type: 'time', title: '8 timer registreret på Projekt Alpha', action: 'registreret', time: '1 dag siden', user: 'Du' },
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
  // Create handlers for Quick Actions
  const requireTeam = () => {
    if (!user) { toast.error('Du er ikke logget ind'); return false }
    if (!teamId) { toast.error('Intet team valgt'); return false }
    return true
  }

  const resetForms = () => {
    setBugForm({ title: '', description: '', priority: 'medium' })
    setFeatureForm({ title: '', description: '', priority: 'medium' })
    setKnowledgeForm({ title: '', content: '', category: '' })
    setTimeForm({ description: '', project: '', hours: 1, date: new Date().toISOString().slice(0,10) })
  }

  const createBug = async () => {
    if (!requireTeam()) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('bugs').insert({
        title: bugForm.title.trim(),
        description: bugForm.description.trim(),
        priority: bugForm.priority,
        status: 'open',
        team_id: teamId,
        created_by: user!.id,
      })
      if (error) throw error
      toast.success('Bug oprettet')
      setShowBugModal(false)
      resetForms()
      fetchDashboardData()
    } catch (e: any) {
      console.error(e)
      toast.error('Kunne ikke oprette bug')
    } finally {
      setSubmitting(false)
    }
  }

  const createFeature = async () => {
    if (!requireTeam()) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('feature_requests').insert({
        title: featureForm.title.trim(),
        description: featureForm.description.trim(),
        priority: featureForm.priority,
        status: 'pending',
        votes: 0,
        team_id: teamId,
        created_by: user!.id,
      })
      if (error) throw error
      toast.success('Feature foreslået')
      setShowFeatureModal(false)
      resetForms()
      fetchDashboardData()
    } catch (e: any) {
      console.error(e)
      toast.error('Kunne ikke oprette feature')
    } finally {
      setSubmitting(false)
    }
  }

  const createKnowledge = async () => {
    if (!requireTeam()) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('knowledge_cases').insert({
        title: knowledgeForm.title.trim(),
        content: knowledgeForm.content.trim(),
        category: knowledgeForm.category.trim() || null,
        team_id: teamId,
        created_by: user!.id,
      })
      if (error) throw error
      toast.success('Viden oprettet')
      setShowKnowledgeModal(false)
      resetForms()
      fetchDashboardData()
    } catch (e: any) {
      console.error(e)
      toast.error('Kunne ikke oprette viden')
    } finally {
      setSubmitting(false)
    }
  }

  const createTime = async () => {
    if (!requireTeam()) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('time_logs').insert({
        description: timeForm.description.trim(),
        project: timeForm.project.trim(),
        hours: Number(timeForm.hours) || 0,
        date: timeForm.date,
        team_id: teamId,
        user_id: user!.id,
      })
      if (error) throw error
      toast.success('Tid registreret')
      setShowTimeModal(false)
      resetForms()
      fetchDashboardData()
    } catch (e: any) {
      console.error(e)
      toast.error('Kunne ikke registrere tid')
    } finally {
      setSubmitting(false)
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

      {/* Quick Action Modals */}
      <FormModal
        isOpen={showBugModal}
        onClose={() => setShowBugModal(false)}
        title="Rapporter bug"
        onSubmit={createBug}
        loading={submitting}
        submitDisabled={!bugForm.title.trim() || !bugForm.description.trim()}
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="form-label">Titel</label>
            <input className="form-input" value={bugForm.title} onChange={(e)=>setBugForm(v=>({...v,title:e.target.value}))} placeholder="Kort titel" />
          </div>
          <div>
            <label className="form-label">Beskrivelse</label>
            <textarea className="form-input" rows={4} value={bugForm.description} onChange={(e)=>setBugForm(v=>({...v,description:e.target.value}))} placeholder="Hvad gik galt?" />
          </div>
          <div>
            <label className="form-label">Prioritet</label>
            <select className="form-input" value={bugForm.priority} onChange={(e)=>setBugForm(v=>({...v,priority:e.target.value as any}))}>
              <option value="low">Lav</option>
              <option value="medium">Mellem</option>
              <option value="high">Høj</option>
              <option value="critical">Kritisk</option>
            </select>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={showFeatureModal}
        onClose={() => setShowFeatureModal(false)}
        title="Foreslå feature"
        onSubmit={createFeature}
        loading={submitting}
        submitDisabled={!featureForm.title.trim() || !featureForm.description.trim()}
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="form-label">Titel</label>
            <input className="form-input" value={featureForm.title} onChange={(e)=>setFeatureForm(v=>({...v,title:e.target.value}))} placeholder="Hvad skal bygges?" />
          </div>
          <div>
            <label className="form-label">Beskrivelse</label>
            <textarea className="form-input" rows={4} value={featureForm.description} onChange={(e)=>setFeatureForm(v=>({...v,description:e.target.value}))} placeholder="Hvorfor og hvordan?" />
          </div>
          <div>
            <label className="form-label">Prioritet</label>
            <select className="form-input" value={featureForm.priority} onChange={(e)=>setFeatureForm(v=>({...v,priority:e.target.value as any}))}>
              <option value="low">Lav</option>
              <option value="medium">Mellem</option>
              <option value="high">Høj</option>
            </select>
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={showKnowledgeModal}
        onClose={() => setShowKnowledgeModal(false)}
        title="Tilføj viden"
        onSubmit={createKnowledge}
        loading={submitting}
        submitDisabled={!knowledgeForm.title.trim() || !knowledgeForm.content.trim()}
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="form-label">Titel</label>
            <input className="form-input" value={knowledgeForm.title} onChange={(e)=>setKnowledgeForm(v=>({...v,title:e.target.value}))} placeholder="Artikel titel" />
          </div>
          <div>
            <label className="form-label">Kategori (valgfri)</label>
            <input className="form-input" value={knowledgeForm.category} onChange={(e)=>setKnowledgeForm(v=>({...v,category:e.target.value}))} placeholder="Kategori" />
          </div>
          <div>
            <label className="form-label">Indhold</label>
            <textarea className="form-input" rows={6} value={knowledgeForm.content} onChange={(e)=>setKnowledgeForm(v=>({...v,content:e.target.value}))} placeholder="Skriv indhold her..." />
          </div>
        </div>
      </FormModal>

      <FormModal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        title="Registrer tid"
        onSubmit={createTime}
        loading={submitting}
        submitDisabled={!timeForm.description.trim() || !timeForm.date}
      >
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="form-label">Beskrivelse</label>
            <input className="form-input" value={timeForm.description} onChange={(e)=>setTimeForm(v=>({...v,description:e.target.value}))} placeholder="Hvad har du arbejdet på?" />
          </div>
          <div>
            <label className="form-label">Projekt</label>
            <input className="form-input" value={timeForm.project} onChange={(e)=>setTimeForm(v=>({...v,project:e.target.value}))} placeholder="Projektnavn" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Timer</label>
              <input type="number" min={0} step={0.25} className="form-input" value={timeForm.hours} onChange={(e)=>setTimeForm(v=>({...v,hours: Number(e.target.value)}))} />
            </div>
            <div>
              <label className="form-label">Dato</label>
              <input type="date" className="form-input" value={timeForm.date} onChange={(e)=>setTimeForm(v=>({...v,date:e.target.value}))} />
            </div>
          </div>
        </div>
      </FormModal>

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
            <button
              onClick={() => setShowBugModal(true)}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">Rapporter bug</span>
            </button>
            <button
              onClick={() => setShowFeatureModal(true)}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">Foreslå feature</span>
            </button>
            <button
              onClick={() => setShowKnowledgeModal(true)}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">Tilføj viden</span>
            </button>
            <button
              onClick={() => setShowTimeModal(true)}
              className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="h-5 w-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">Registrer tid</span>
            </button>
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
