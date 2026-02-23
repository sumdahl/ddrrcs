import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase-client'
import { RequestsTable } from '@/components/tables/requests-table'
import { StatsCard } from '@/components/dashboard/stats-card'
import type { ReliefRequest } from '@/types/database'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState<ReliefRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: '/auth/login' })
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('relief_requests')
      .select('*')
      .eq('citizen_id', user!.id)
      .order('created_at', { ascending: false })

    if (data) setRequests(data)
    setLoading(false)
  }

  if (authLoading || loading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }

  if (!user) return null

  const pending = requests.filter(r => r.status === 'pending').length
  const resolved = requests.filter(r => r.status === 'resolved').length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Citizen Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Total Requests" value={requests.length} />
        <StatsCard title="Pending" value={pending} variant="warning" />
        <StatsCard title="Resolved" value={resolved} variant="success" />
        <StatsCard title="Critical" value={requests.filter(r => r.priority === 'critical').length} variant="critical" />
      </div>

      <RequestsTable
        requests={requests}
        title="Your Requests"
      />
    </div>
  )
}
