import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getReliefRequests, getRequestStats, updateReliefRequest } from '@/server/requests'
import { RequestsTable } from '@/components/tables/requests-table'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AdminUpdateForm } from '@/components/forms/admin-update-form'
import type { ReliefRequest } from '@/types/database'

interface RequestWithProfile extends ReliefRequest {
  profiles?: { full_name: string }
}

interface Stats {
  total: number
  pending: number
  approved: number
  assigned: number
  resolved: number
  critical: number
  high: number
  medium: number
  low: number
  byDisasterType: {
    flood: number
    earthquake: number
    landslide: number
    fire: number
  }
}

export const Route = createFileRoute('/admin/')({
  component: AdminPage,
})

function AdminPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState<RequestWithProfile[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ReliefRequest | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      navigate({ to: '/' })
    }
  }, [user, profile, authLoading, navigate])

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchData()
    }
  }, [user, profile])

  const fetchData = async () => {
    const [requestsData, statsData] = await Promise.all([
      getReliefRequests(),
      getRequestStats(),
    ])
    setRequests(requestsData as RequestWithProfile[])
    setStats(statsData as Stats)
    setLoading(false)
  }

  const handleUpdate = async (data: { status?: string; assigned_team?: string | null; admin_remark?: string | null }) => {
    if (!selectedRequest) return
    setUpdating(true)
    try {
      await updateReliefRequest({ data: { id: selectedRequest.id, ...data } } as never)
      setSelectedRequest(null)
      fetchData()
    } finally {
      setUpdating(false)
    }
  }

  if (authLoading || loading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }

  if (!user || profile?.role !== 'admin') return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Total Requests" value={stats?.total ?? 0} />
        <StatsCard title="Pending" value={stats?.pending ?? 0} variant="warning" />
        <StatsCard title="Critical" value={stats?.critical ?? 0} variant="critical" />
        <StatsCard title="Resolved" value={stats?.resolved ?? 0} variant="success" />
      </div>

      <RequestsTable
        requests={requests}
        title="All Relief Requests"
        showCitizen
        onRequestClick={(request) => setSelectedRequest(request)}
      />

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Disaster:</span> <span className="capitalize">{selectedRequest.disaster_type}</span></div>
                <div><span className="text-muted-foreground">Ward:</span> {selectedRequest.ward_number}</div>
                <div><span className="text-muted-foreground">Relief Type:</span> <span className="capitalize">{selectedRequest.relief_type}</span></div>
                <div><span className="text-muted-foreground">Priority:</span> <span className="capitalize">{selectedRequest.priority}</span></div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Location:</span> {selectedRequest.location_details}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Damage:</span> {selectedRequest.damage_description}
              </div>
              <AdminUpdateForm request={selectedRequest} onSubmit={handleUpdate} isSubmitting={updating} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
