import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Priority } from '@/types/database'

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-slate-500' },
  medium: { label: 'Medium', className: 'bg-blue-500' },
  high: { label: 'High', className: 'bg-orange-500' },
  critical: { label: 'Critical', className: 'bg-destructive' },
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority]
  return (
    <Badge className={cn(config.className, 'text-white')}>
      {config.label}
    </Badge>
  )
}
