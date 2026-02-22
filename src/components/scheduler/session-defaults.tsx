import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAvailability, useNotificationPreferences } from '@/hooks/use-scheduler'
import { Sun, CloudSun, Moon } from 'lucide-react'

const SESSION_DURATIONS = [15, 30, 45, 60] as const
const REMINDER_OPTIONS = [
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
] as const

const PREFERRED_TIMES = [
  { key: 'morning' as const, label: 'Morning', icon: Sun },
  { key: 'afternoon' as const, label: 'Afternoon', icon: CloudSun },
  { key: 'evening' as const, label: 'Evening', icon: Moon },
] as const

export function SessionDefaults() {
  const { availability, isLoading, updateAvailability, isUpdating } = useAvailability()
  const { preferences, updatePreferences, isUpdating: isPrefsUpdating } = useNotificationPreferences()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-shadow duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="text-base uppercase tracking-wide">
          Session defaults
        </CardTitle>
        <CardDescription>
          Default session length and preferred study times
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label>Default session duration</Label>
          <Select
            value={String(availability.default_session_minutes)}
            onValueChange={(v) =>
              updateAvailability({
                default_session_minutes: Number(v) as 15 | 30 | 45 | 60,
              })
            }
            disabled={isUpdating}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SESSION_DURATIONS.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Preferred times</Label>
          <p className="text-sm text-muted-foreground mt-1 mb-2">
            When do you prefer to study? (Used for AI suggestions)
          </p>
          <div className="flex flex-wrap gap-2">
            {PREFERRED_TIMES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  updateAvailability({
                    preferred_times: {
                      ...availability.preferred_times,
                      [key]: !availability.preferred_times[key],
                    },
                  })
                }
                disabled={isUpdating}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200',
                  availability.preferred_times[key]
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-input hover:bg-accent/5'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Default reminder lead time</Label>
          <Select
            value={String(preferences.default_reminder_minutes)}
            onValueChange={(v) =>
              updatePreferences({
                default_reminder_minutes: Number(v),
              })
            }
            disabled={isPrefsUpdating}
          >
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REMINDER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={String(o.value)}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
