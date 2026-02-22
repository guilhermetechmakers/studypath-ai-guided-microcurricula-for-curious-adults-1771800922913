import { Calendar, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Lesson } from '@/types/curriculum'
import type { ScheduleEntry } from '@/api/curriculum'

interface SchedulerMiniProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson?: Lesson | null
  lessons?: Lesson[]
  suggestedSchedule?: ScheduleEntry[]
  onConfirm?: (entries: ScheduleEntry[]) => void
  isLoading?: boolean
}

export function SchedulerMini({
  open,
  onOpenChange,
  lesson,
  lessons = [],
  suggestedSchedule = [],
  onConfirm,
  isLoading = false,
}: SchedulerMiniProps) {
  const items = lesson ? [lesson] : lessons
  const displaySchedule = suggestedSchedule.slice(0, 7)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md"
        aria-labelledby="scheduler-title"
        aria-describedby="scheduler-description"
      >
        <DialogHeader>
          <DialogTitle id="scheduler-title">
            {items.length === 1 ? 'Schedule lesson' : 'Schedule lessons'}
          </DialogTitle>
          <DialogDescription id="scheduler-description">
            {items.length === 1
              ? `Add "${items[0]?.title}" to your study queue with recommended spaced review.`
              : `Add ${items.length} lessons to your study queue.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {displaySchedule.length > 0 && (
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-medium">First 7 sessions</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {displaySchedule.map((e) => (
                  <li key={e.id} className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    {new Date(e.scheduled_at).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}{' '}
                    · {e.duration_minutes} min · {e.type}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {displaySchedule.length === 0 && !isLoading && (
            <p className="text-sm text-muted-foreground">
              Sessions will be scheduled based on your availability and spaced repetition rules.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm?.(suggestedSchedule)
              onOpenChange(false)
            }}
            disabled={isLoading}
          >
            <Check className="h-4 w-4 mr-2" />
            Confirm schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
