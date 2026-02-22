import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { History, Mail, Smartphone, MessageSquare } from 'lucide-react'
import { useNotificationHistory } from '@/hooks/use-scheduler'
import type { NotificationLog, NotificationType } from '@/types/scheduler'
import { cn } from '@/lib/utils'

const DAY_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
] as const

const TYPE_ICONS: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  push: Smartphone,
  email: Mail,
  in_app: MessageSquare,
}

function StatusBadge({ status }: { status: NotificationLog['status'] }) {
  const config: Record<NotificationLog['status'], { variant: 'default' | 'secondary' | 'success' | 'outline'; label: string }> = {
    queued: { variant: 'secondary', label: 'Queued' },
    sent: { variant: 'default', label: 'Sent' },
    delivered: { variant: 'default', label: 'Delivered' },
    opened: { variant: 'success', label: 'Opened' },
    failed: { variant: 'outline', label: 'Failed' },
  }
  const { variant, label } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

function formatLogDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function HistoryTimeline() {
  const [days, setDays] = useState(30)
  const { data: logs = [], isLoading } = useNotificationHistory(days)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-shadow duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-base uppercase tracking-wide">
              <History className="h-5 w-5" />
              History
            </CardTitle>
            <CardDescription>
              Recent notifications and session activity
            </CardDescription>
          </div>
          <Select
            value={String(days)}
            onValueChange={(v) => setDays(Number(v))}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No notification history for this period.
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {logs.map((log) => {
              const Icon = TYPE_ICONS[log.type]
              return (
                <div
                  key={log.id}
                  className={cn(
                    'flex items-start gap-3 py-3 border-b last:border-0',
                    'animate-in'
                  )}
                >
                  <div className="rounded-full bg-muted/50 p-2 shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium capitalize">
                        {log.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {log.category.replace('_', ' ')}
                      </span>
                      <StatusBadge status={log.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatLogDate(log.timestamp)}
                      {log.session_id && ` · Session ${log.session_id.slice(0, 8)}...`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
