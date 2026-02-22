import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Session } from '@/types/scheduler'

function formatSessionDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface ConfirmCancelModalProps {
  session: Session
  onClose: () => void
  onConfirm: () => void
}

export function ConfirmCancelModal({ session, onClose, onConfirm }: ConfirmCancelModalProps) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent showClose className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel session</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this session? You can reschedule it later.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border p-4 bg-muted/20">
          <p className="font-medium">{session.lesson_title ?? session.lesson_id}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {formatSessionDate(session.scheduled_at)} · {session.duration_minutes} min
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="secondary" onClick={onClose}>
            Keep session
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
          >
            Cancel session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
