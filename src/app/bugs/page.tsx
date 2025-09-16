'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { createSupabaseClient } from '@/lib/supabase'
import AppLayout from '@/components/layout/AppLayout'
import Button from '@/components/common/Button'
import { Input, Select } from '@/components/common/Input'
import Table from '@/components/common/Table'
import { StatusBadge, PriorityBadge } from '@/components/common/Badge'
import { SkeletonTable } from '@/components/common/SkeletonLoaders'
import Alert from '@/components/common/Alert'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BugAntIcon,
  UserIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import { format } from 'date-fns'
import { da } from 'date-fns/locale'

interface Bug {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigned_to: string | null
  team_id: string
  created_by: string
  created_at: string
  updated_at: string
  creator?: {
    full_name: string | null
    email: string
  }
  assignee?: {
    full_name: string | null
    email: string
  }
}

const statusOptions = [
  { value: '', label: 'Alle statusser' },
  { value: 'open', label: 'Åben' },
  { value: 'in_progress', label: 'I gang' },
  { value: 'resolved', label: 'Løst' },
  { value: 'closed', label: 'Lukket' },
]

const priorityOptions = [
  { value: '', label: 'Alle prioriteter' },
  { value: 'low', label: 'Lav' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'Høj' },
  { value: 'critical', label: 'Kritisk' },
]

export default function BugsPage() {
  const { profile } = useAuth()
  const [bugs, setBugs] = useState<Bug[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'priority'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const supabase = createSupabaseClient()

  useEffect(() => {
    const fetchBugs = async () => {
      if (!profile?.team_id) return
      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from('bugs')
          .select(`
            *,
            creator:users!bugs_created_by_fkey(full_name, email),
            assignee:users!bugs_assigned_to_fkey(full_name, email)
          `)
          .eq('team_id', profile.team_id)
          .order(sortBy, { ascending: sortOrder === 'asc' })

        if (error) throw error
        setBugs(data || [])
      } catch (error: any) {
        console.error('Error fetching bugs:', error)
        setError('Kunne ikke indlæse bugs. Prøv igen senere.')
      } finally {
        setLoading(false)
      }
    }

    fetchBugs()
  }, [profile?.team_id, supabase, sortBy, sortOrder])

  const filteredBugs = bugs.filter(bug => {
    const matchesSearch =
      bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bug.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !selectedStatus || bug.status === selectedStatus
    const matchesPriority = !selectedPriority || bug.priority === selectedPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleBugClick = (bug: Bug) => {
    console.log('Navigate to bug:', bug.id)
  }

  const columns = [
    {
      key: 'title',
      label: 'Titel',
      sortable: true,
      render: (bug: Bug) => (
        <div>
          <h4 className="font-medium text-gray-900">{bug.title}</h4>
          <p className="text-sm text-gray-500 line-clamp-2">{bug.description}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (bug: Bug) => <StatusBadge status={bug.status as any} />,
    },
    {
      key: 'priority',
      label: 'Prioritet',
      render: (bug: Bug) => <PriorityBadge priority={bug.priority as any} />,
    },
    {
      key: 'assignee',
      label: 'Tildelt',
      render: (bug: Bug) => (
        <div className="flex items-center">
          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-900">
            {bug.assignee?.full_name || bug.assignee?.email || 'Ikke tildelt'}
          </span>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Oprettet',
      sortable: true,
      render: (bug: Bug) => (
        <div className="text-sm text-gray-500">
          {format(new Date(bug.created_at), 'dd/MM/yyyy', { locale: da })}
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bug Tracking</h1>
            <p className="mt-1 text-sm text-gray-500">
              Spor og håndter bugs og fejl i jeres projekter
            </p>
          </div>
          <Button href="/bugs/new" icon={<PlusIcon className="h-5 w-5" />}>
            Ny Bug
          </Button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Søg i bugs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>

            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
              placeholder="Status"
            />

            <Select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              options={priorityOptions}
              placeholder="Prioritet"
            />

            <Button
              variant="ghost"
              icon={<FunnelIcon className="h-5 w-5" />}
              onClick={() => {
                setSearchTerm('')
                setSelectedStatus('')
                setSelectedPriority('')
              }}
            >
              Ryd filtre
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Bugs Table */}
        <div className="card">
          {loading ? (
            <SkeletonTable rows={5} columns={5} />
          ) : filteredBugs.length === 0 ? (
            <div className="text-center py-12">
              <BugAntIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {bugs.length === 0 ? 'Ingen bugs endnu' : 'Ingen bugs matcher dine filtre'}
              </h3>
              <p className="text-gray-500 mb-6">
                {bugs.length === 0
                  ? 'Start med at rapportere din første bug'
                  : 'Prøv at justere dine søgekriterier'}
              </p>
              {bugs.length === 0 && (
                <Button href="/bugs/new" icon={<PlusIcon className="h-5 w-5" />}>
                  Rapporter Bug
                </Button>
              )}
            </div>
          ) : (
            <Table
              columns={columns}
              data={filteredBugs}
              onRowClick={handleBugClick}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(key, order) => {
                setSortBy(key as any)
                setSortOrder(order)
              }}
            />
          )}
        </div>
      </div>
    </AppLayout>
  )
}
