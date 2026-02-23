import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { ReliefRequestForm } from '@/components/forms/relief-request-form'
import { useAuth } from '@/hooks/use-auth'
import { createReliefRequest } from '@/server/requests'
import { toast } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { z } from 'zod'
import { reliefRequestSchema } from '@/schemas/relief-request.schema'

type ReliefRequestInput = z.infer<typeof reliefRequestSchema>

export const Route = createFileRoute('/submit/')({
  component: SubmitPage,
})

function SubmitPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [submittedId, setSubmittedId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: '/auth/login' })
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (data: ReliefRequestInput) => {
    if (!user) return
    
    setSubmitting(true)
    try {
      const result = await createReliefRequest({ data: { ...data, citizen_id: user.id } } as never)
      setSubmittedId((result as { id: string }).id)
    } catch (error) {
      toast.error('Failed to submit request', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyId = async () => {
    if (!submittedId) return
    try {
      await navigator.clipboard.writeText(submittedId)
      toast.success('Request ID copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleTrackRequest = () => {
    if (submittedId) {
      navigate({ to: '/track', search: { id: submittedId } })
    }
  }

  const handleReset = () => {
    setSubmittedId(null)
  }

  if (authLoading) {
    return <div className="flex justify-center py-8">Loading...</div>
  }

  if (!user) {
    return null
  }

  if (submittedId) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Request Submitted Successfully</CardTitle>
            <CardDescription>
              Your disaster relief request has been received and is being processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Your Request ID</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded-md bg-muted px-4 py-3 text-sm font-mono break-all">
                  {submittedId}
                </code>
                <Button variant="outline" size="icon" onClick={handleCopyId}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Save this ID to track your request status. You can also find it in your dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleTrackRequest} className="flex-1">
                <ExternalLink className="h-4 w-4 mr-2" />
                Track Request
              </Button>
              <Button variant="outline" onClick={handleReset} className="flex-1">
                Submit Another Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Submit Relief Request</h1>
      <ReliefRequestForm onSubmit={handleSubmit} isSubmitting={submitting} />
    </div>
  )
}
