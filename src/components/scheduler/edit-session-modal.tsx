import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUpdateSession } from '@/hooks/use-scheduler'
import type { Session } from '@/types/scheduler'

const schema = z.object({
  scheduled_at: z.string().min(1, 'Select date and time'),
  duration_minutes: z.enum(['15', '30', '45', '60']),
  reminder_lead_minutes: z.enum(['5', '15', '30', '60', '1440']),
})

type FormValues = z.infer<typeof schema>

interface EditSessionModalProps {
  session: Session
  onClose: () => void
  onSaved: () => void
}

export function EditSessionModal({ session, onClose, onSaved }: EditSessionModalProps) {
  const updateSession = useUpdateSession()

  const toDatetimeLocal = (iso: string) => {
    const d = new Date(iso)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const h = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day}T${h}:${min}`
  }

  const reminderVal = String(session.reminder_lead_minutes)
  const reminderDefault = ['5', '15', '30', '60', '1440'].includes(reminderVal)
    ? reminderVal
    : '30'

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      scheduled_at: toDatetimeLocal(session.scheduled_at),
      duration_minutes: String(session.duration_minutes) as '15' | '30' | '45' | '60',
      reminder_lead_minutes: reminderDefault as FormValues['reminder_lead_minutes'],
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    const scheduledAt = new Date(values.scheduled_at).toISOString()
    await updateSession.mutateAsync({
      id: session.id,
      updates: {
        scheduled_at: scheduledAt,
        duration_minutes: Number(values.duration_minutes) as 15 | 30 | 45 | 60,
        reminder_lead_minutes: Number(values.reminder_lead_minutes),
      },
    })
    onSaved()
  })

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent showClose className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit session</DialogTitle>
          <DialogDescription>
            Change the time, duration, or reminder for this session.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="scheduled_at">Date & time</Label>
            <Input
              id="scheduled_at"
              type="datetime-local"
              {...form.register('scheduled_at')}
              className="mt-2"
            />
            {form.formState.errors.scheduled_at && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.scheduled_at.message}
              </p>
            )}
          </div>
          <div>
            <Label>Duration</Label>
            <Select
              value={form.watch('duration_minutes')}
              onValueChange={(v) => form.setValue('duration_minutes', v as FormValues['duration_minutes'])}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[15, 30, 45, 60].map((m) => (
                  <SelectItem key={m} value={String(m)}>
                    {m} minutes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Reminder</Label>
            <Select
              value={form.watch('reminder_lead_minutes')}
              onValueChange={(v) => form.setValue('reminder_lead_minutes', v as FormValues['reminder_lead_minutes'])}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
                <SelectItem value="1440">1 day before</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateSession.isPending}>
              {updateSession.isPending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
