import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Shield, Users, ArrowLeft, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { checkAdminExists, getAllUsers, promoteToAdmin, demoteToCitizen } from '@/server/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from '@/components/ui/sonner'

export const Route = createFileRoute('/admin/setup')({
  component: AdminSetupPage,
})

type User = {
  id: string
  full_name: string
  role: 'citizen' | 'admin'
  created_at: string
}

function AdminSetupPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [adminExists, setAdminExists] = useState<boolean | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: '/auth/login' })
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    if (user) {
      checkSetup()
    }
  }, [user])

  const checkSetup = async () => {
    setLoading(true)
    try {
      const exists = await checkAdminExists()
      setAdminExists(exists)
      
      if (exists && profile?.role === 'admin') {
        const usersData = await getAllUsers()
        setUsers(usersData as User[])
      }
    } catch (err) {
      toast.error('Failed to check admin status')
    } finally {
      setLoading(false)
    }
  }

  const handleBecomeAdmin = async () => {
    if (!user) return
    
    setActionLoading('self')
    
    try {
      await promoteToAdmin({ data: { targetUserId: user.id, requestUserId: user.id } } as never)
      toast.success('You are now an admin', {
        description: 'Redirecting to refresh your session...',
      })
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      toast.error('Failed to become admin', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handlePromote = async (targetUserId: string, targetName: string) => {
    if (!user) return
    
    setActionLoading(targetUserId)
    
    try {
      await promoteToAdmin({ data: { targetUserId, requestUserId: user.id } } as never)
      toast.success(`${targetName} promoted to admin`)
      await checkSetup()
    } catch (err) {
      toast.error('Failed to promote user', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleDemote = async (targetUserId: string, targetName: string) => {
    if (!user) return
    
    setActionLoading(targetUserId)
    
    try {
      await demoteToCitizen({ data: { targetUserId, requestUserId: user.id } } as never)
      toast.success(`${targetName} demoted to citizen`)
      await checkSetup()
    } catch (err) {
      toast.error('Failed to demote user', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  const isAdmin = profile?.role === 'admin'
  const showFirstTimeSetup = !adminExists
  const showAdminPanel = adminExists && isAdmin
  const showAccessDenied = adminExists && !isAdmin

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Admin Setup
          </h1>
          <p className="text-muted-foreground">Manage system administrators</p>
        </div>
      </div>

      {showFirstTimeSetup && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              First-Time Setup
            </CardTitle>
            <CardDescription>
              No admin has been configured yet. You can become the first administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Important</AlertTitle>
              <AlertDescription>
                This action will grant you full administrative access to the system.
                This includes the ability to view all relief requests, manage users,
                and promote other administrators.
              </AlertDescription>
            </Alert>

            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">You are signed in as:</p>
              <p className="font-medium">{user.email}</p>
              <p className="text-sm text-muted-foreground">{profile?.full_name}</p>
            </div>

            <Button 
              onClick={handleBecomeAdmin}
              disabled={actionLoading !== null}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              {actionLoading === 'self' ? 'Setting up...' : 'Become Admin'}
            </Button>
          </CardContent>
        </Card>
      )}

      {showAdminPanel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Promote or demote users to manage administrative access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell>
                          <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {u.role === 'admin' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDemote(u.id, u.full_name)}
                              disabled={actionLoading !== null || u.id === user.id}
                            >
                              {actionLoading === u.id ? 'Updating...' : 'Demote'}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromote(u.id, u.full_name)}
                              disabled={actionLoading !== null}
                            >
                              {actionLoading === u.id ? 'Updating...' : 'Promote'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {showAccessDenied && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              An administrator has already been configured for this system.
              Only existing admins can promote new users.
            </p>
            <p className="text-muted-foreground">
              If you need admin access, please contact an existing administrator.
            </p>
            <Link to="/">
              <Button>Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
