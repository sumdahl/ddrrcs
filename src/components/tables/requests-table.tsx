import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/dashboard/status-badge'
import { PriorityBadge } from '@/components/dashboard/priority-badge'
import type { ReliefRequest } from '@/types/database'

interface RequestWithProfile extends ReliefRequest {
  profiles?: { full_name: string }
}

interface RequestsTableProps {
  requests: RequestWithProfile[]
  title: string
  showCitizen?: boolean
  onRequestClick?: (request: ReliefRequest) => void
}

export function RequestsTable({ requests, title, showCitizen = false, onRequestClick }: RequestsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                {showCitizen && <TableHead>Citizen</TableHead>}
                <TableHead>Disaster Type</TableHead>
                <TableHead>Ward</TableHead>
                <TableHead>Relief Type</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={showCitizen ? 8 : 7} className="text-center text-muted-foreground">
                    No requests found
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow
                    key={request.id}
                    className={onRequestClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                    onClick={() => onRequestClick?.(request)}
                  >
                    <TableCell className="font-mono text-xs">
                      {request.id.slice(0, 8)}...
                    </TableCell>
                    {showCitizen && (
                      <TableCell>{request.profiles?.full_name || 'Unknown'}</TableCell>
                    )}
                    <TableCell className="capitalize">{request.disaster_type}</TableCell>
                    <TableCell>{request.ward_number}</TableCell>
                    <TableCell className="capitalize">{request.relief_type}</TableCell>
                    <TableCell><PriorityBadge priority={request.priority} /></TableCell>
                    <TableCell><StatusBadge status={request.status} /></TableCell>
                    <TableCell>{formatDate(request.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
