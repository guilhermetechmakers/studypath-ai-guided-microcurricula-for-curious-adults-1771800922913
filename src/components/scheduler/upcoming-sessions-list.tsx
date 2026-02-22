import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Pencil, X, CheckCircle2 } from 'lucide-react'
import { useSessions, useUpdateSession, useCancelSession } from '@/hooks/use-scheduler'
import { EditSessionModal } from './edit-session-modal'
import { ConfirmCancelModal } from './confirm-cancel-modal'
import type { Session } from '@/types/scheduler'
import { cn } from '@/lib/utils'

function formatSessionDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sessionDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = Math.floor((sessionDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
  const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (diff === 0) return `Today, ${timeStr}`
  if (diff === 1) return `Tomorrow, ${timeStr}`
  if (diff < 7) return `${d.toLocaleDateString(undefined, { weekday: 'short' })}, ${timeStr}`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

function StatusBadge({ status }: { status: Session['status'] }) {
  const config = {
    scheduled: { variant: 'default' as const, label: 'Scheduled' },
    completed: { variant: 'success' as const, label: 'Completed' },
    canceled: { variant: 'secondary' as const, label: 'Canceled' },
    skipped: { variant: 'secondary' as const, label: 'Skipped' },
  }
  const { variant, label } = config[status]
  return <Badge variant={variant}>{label}</Badge>
}

export function UpcomingSessionsList() {
  const { data: sessions = [], isLoading } = useSessions({ limit: 20 })
  const updateSession = useUpdateSession()
  const cancelSession = useCancelSession()
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [cancelingSession, setCancelingSession] = useState<Session | null>(null)

  const scheduledSessions = sessions.filter((s) => s.status === 'scheduled')

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
    <>
      <Card className="transition-shadow duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base uppercase tracking-wide">
            <Calendar className="h-5 w-5" />
            Upcoming sessions
          </CardTitle>
          <CardDescription>
            Your scheduled study sessions. Edit, reschedule, or cancel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scheduledSessions.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No upcoming sessions. Get AI suggestions or schedule manually.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledSessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                    'rounded-lg border p-4 transition-all duration-200',
                    'hover:shadow-md hover:border-accent/20'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {session.lesson_title ?? session.lesson_id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatSessionDate(session.scheduled_at)} · {session.duration_minutes} min
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={session.status} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingSession(session)}
                      className="transition-transform hover:scale-105"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      asChild
                      className="transition-transform hover:scale-105"
                    >
                      <Link
                        to={`/dashboard/curricula/${session.curriculum_id}/lesson/${session.lesson_id}`}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Start
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCancelingSession(session)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-transform hover:scale-105"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingSession && (
        <EditSessionModal
          session={editingSession}
          onClose={() => setEditingSession(null)}
          onSaved={() => {
            setEditingSession(null)
            updateSession.reset()
          }}
        />
      )}

      {cancelingSession && (
        <ConfirmCancelModal
          session={cancelingSession}
          onClose={() => setCancelingSession(null)}
          onConfirm={() => {
            cancelSession.mutate({ id: cancelingSession.id })
            setCancelingSession(null)
          }}
        />
      )}
    </>
  )
}
