import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getRequestStats } from '@/server/requests'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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

export const Route = createFileRoute('/admin/analytics')({
  component: AnalyticsPage,
})

const COLORS = ['#eab308', '#0ea5e9', '#f97316', '#22c55e']

function AnalyticsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

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
    const statsData = await getRequestStats()
    setStats(statsData as Stats)
    setLoading(false)
  }

  if (authLoading || loading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }

  if (!user || profile?.role !== 'admin') return null

  const disasterData = stats ? [
    { name: 'Flood', value: stats.byDisasterType.flood },
    { name: 'Earthquake', value: stats.byDisasterType.earthquake },
    { name: 'Landslide', value: stats.byDisasterType.landslide },
    { name: 'Fire', value: stats.byDisasterType.fire },
  ] : []

  const statusData = stats ? [
    { name: 'Pending', value: stats.pending },
    { name: 'Approved', value: stats.approved },
    { name: 'Assigned', value: stats.assigned },
    { name: 'Resolved', value: stats.resolved },
  ] : []

  const priorityData = stats ? [
    { name: 'Critical', value: stats.critical },
    { name: 'High', value: stats.high },
    { name: 'Medium', value: stats.medium },
    { name: 'Low', value: stats.low },
  ] : []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard title="Total Requests" value={stats?.total ?? 0} />
        <StatsCard title="Pending" value={stats?.pending ?? 0} variant="warning" />
        <StatsCard title="Critical" value={stats?.critical ?? 0} variant="critical" />
        <StatsCard title="Resolved" value={stats?.resolved ?? 0} variant="success" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Requests by Disaster Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={disasterData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={70}
                    dataKey="value"
                  >
                    {statusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
