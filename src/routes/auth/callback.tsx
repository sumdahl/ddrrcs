import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/auth/callback')({
  component: CallbackPage,
})

function CallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function handleCallback() {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
              navigate({ to: '/' })
              return
            }
            if (!error.message.includes('PKCE')) {
              throw error
            }
          }
          navigate({ to: '/' })
        } else if (accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          })
          if (error) throw error
          navigate({ to: '/' })
        } else {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            navigate({ to: '/' })
          } else {
            throw new Error('No authentication code or token found')
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed')
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [navigate])

  if (loading) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Signing you in...</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            Please wait while we complete your authentication.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => navigate({ to: '/auth/login' })}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
