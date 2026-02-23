import { Badge } from '@/components/ui/badge'
import type { Status } from '@/types/database'

const statusConfig: Record<Status, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  assigned: { label: 'Assigned', variant: 'outline' },
  resolved: { label: 'Resolved', variant: 'outline' },
}

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status]
  return <Badge variant={config.variant}>{config.label}</Badge>
}
