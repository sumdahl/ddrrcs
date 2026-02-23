import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase-client'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { PriorityBadge } from '@/components/dashboard/priority-badge'
import { useAuth } from '@/hooks/use-auth'
import { History, Search } from 'lucide-react'
import type { ReliefRequest } from '@/types/database'

export const Route = createFileRoute('/track/')({
  component: TrackPage,
  validateSearch: (search: Record<string, unknown>) => ({
    id: (search.id as string) || undefined,
  }),
})

function TrackPage() {
  const search = useSearch({ from: '/track/' })
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [requestId, setRequestId] = useState(search.id || '')
  const [request, setRequest] = useState<ReliefRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pastRequests, setPastRequests] = useState<ReliefRequest[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  useEffect(() => {
    if (search.id) {
      setRequestId(search.id)
      fetchRequest(search.id)
    }
  }, [search.id])

  useEffect(() => {
    if (user) {
      fetchPastRequests()
    }
  }, [user])

  const fetchPastRequests = async () => {
    if (!user) return
    
    setLoadingHistory(true)
    const { data } = await supabase
      .from('relief_requests')
      .select('*')
      .eq('citizen_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (data) setPastRequests(data)
    setLoadingHistory(false)
  }

  const fetchRequest = async (id: string) => {
    if (!id.trim()) return

    setLoading(true)
    setError(null)
    setRequest(null)

    const { data, error: fetchError } = await supabase
      .from('relief_requests')
      .select('*')
      .eq('id', id.trim())
      .single()

    if (fetchError) {
      setError('Request not found. Please check the ID and try again.')
    } else {
      setRequest(data)
    }
    setLoading(false)
  }

  const handleSearch = () => {
    if (requestId.trim()) {
      navigate({ to: '/track', search: { id: requestId.trim() } })
    }
  }

  const handleSelectRequest = (id: string) => {
    navigate({ to: '/track', search: { id } })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Track Your Request</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search by ID
              </CardTitle>
              <CardDescription>
                Enter the ID you received when submitting your request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="requestId" className="sr-only">Request ID</Label>
                  <Input
                    id="requestId"
                    placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
                    value={requestId}
                    onChange={(e) => setRequestId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={loading}>
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="text-destructive text-sm mb-4">{error}</div>
          )}

          {request && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Request Details</CardTitle>
                    <CardDescription>ID: {request.id}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <PriorityBadge priority={request.priority} />
                    <StatusBadge status={request.status} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">Disaster Type</dt>
                      <dd className="font-medium capitalize">{request.disaster_type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Ward Number</dt>
                      <dd className="font-medium">{request.ward_number}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Relief Type</dt>
                      <dd className="font-medium capitalize">{request.relief_type}</dd>
                    </div>
                  </div>
                  
                  <div>
                    <dt className="text-sm text-muted-foreground">Location Details</dt>
                    <dd className="font-medium">{request.location_details}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm text-muted-foreground">Damage Description</dt>
                    <dd className="font-medium">{request.damage_description}</dd>
                  </div>
                  
                  {request.assigned_team && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Assigned Team</dt>
                      <dd className="font-medium">{request.assigned_team}</dd>
                    </div>
                  )}
                  
                  {request.admin_remark && (
                    <div>
                      <dt className="text-sm text-muted-foreground">Admin Remark</dt>
                      <dd className="font-medium">{request.admin_remark}</dd>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <dt className="text-sm text-muted-foreground">Submitted</dt>
                      <dd className="font-medium">{new Date(request.created_at).toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Last Updated</dt>
                      <dd className="font-medium">{new Date(request.updated_at).toLocaleString()}</dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card>
          )}
        </div>

        {user && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Your Past Requests
                </CardTitle>
                <CardDescription>
                  Click on any request to view details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : pastRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No requests found.</p>
                    <p className="text-sm mt-1">Submit a relief request to see it here.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pastRequests.map((req) => (
                      <button
                        key={req.id}
                        onClick={() => handleSelectRequest(req.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                          search.id === req.id ? 'border-primary bg-muted/50' : 'border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs text-muted-foreground">
                            {req.id.slice(0, 8)}...
                          </span>
                          <div className="flex gap-1">
                            <PriorityBadge priority={req.priority} />
                            <StatusBadge status={req.status} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="capitalize">{req.disaster_type}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="capitalize">{req.relief_type}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {!user && (
        <Card className="mt-6">
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-2">
              Sign in to view your request history
            </p>
            <Button variant="outline" onClick={() => navigate({ to: '/auth/login' })}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
