import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { statuses } from '@/schemas/relief-request.schema'
import type { ReliefRequest } from '@/types/database'

const updateSchema = z.object({
  status: z.enum(statuses),
  assigned_team: z.string().max(100).optional(),
  admin_remark: z.string().max(500).optional(),
})

type UpdateInput = z.infer<typeof updateSchema>

interface AdminUpdateFormProps {
  request: ReliefRequest
  onSubmit: (data: UpdateInput) => Promise<void>
  isSubmitting?: boolean
}

export function AdminUpdateForm({ request, onSubmit, isSubmitting }: AdminUpdateFormProps) {
  const form = useForm<UpdateInput>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      status: request.status,
      assigned_team: request.assigned_team || '',
      admin_remark: request.admin_remark || '',
    },
  })

  const handleSubmit = async (data: UpdateInput) => {
    await onSubmit(data)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Request</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigned_team"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned Team</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter team name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="admin_remark"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Remark</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add remark..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Updating...' : 'Update Request'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
