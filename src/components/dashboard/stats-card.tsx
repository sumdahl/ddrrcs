import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: number
  description?: string
  variant?: 'default' | 'critical' | 'warning' | 'success'
}

export function StatsCard({ title, value, description, variant = 'default' }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn(
          'text-2xl font-bold',
          variant === 'critical' && 'text-destructive',
          variant === 'warning' && 'text-orange-500',
          variant === 'success' && 'text-green-500',
        )}>
          {value}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}
