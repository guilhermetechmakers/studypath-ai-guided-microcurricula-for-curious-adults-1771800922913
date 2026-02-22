import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, Mail, Smartphone, MessageSquare } from 'lucide-react'
import { useNotificationPreferences } from '@/hooks/use-scheduler'
import { cn } from '@/lib/utils'

const CHANNELS = [
  { key: 'push_enabled' as const, label: 'Push', icon: Smartphone },
  { key: 'email_enabled' as const, label: 'Email', icon: Mail },
  { key: 'in_app_enabled' as const, label: 'In-app', icon: MessageSquare },
] as const

const CATEGORIES = [
  { key: 'session_reminder' as const, label: 'Session reminders' },
  { key: 'milestone' as const, label: 'Milestone alerts' },
  { key: 'suggestion' as const, label: 'New curriculum suggestions' },
] as const

export function NotificationPreferences() {
  const { preferences, isLoading, updatePreferences, isUpdating } = useNotificationPreferences()

  if (isLoading || !preferences) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="transition-shadow duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base uppercase tracking-wide">
          <Bell className="h-5 w-5" />
          Notification preferences
        </CardTitle>
        <CardDescription>
          Choose how you receive reminders and alerts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium">Channels</Label>
          <div className="mt-3 flex flex-wrap gap-4">
            {CHANNELS.map(({ key, label, icon: Icon }) => (
              <div
                key={key}
                className="flex items-center gap-3 rounded-lg border px-4 py-3 min-w-[140px]"
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{label}</span>
                  <Switch
                    checked={preferences[key]}
                    onCheckedChange={(v) =>
                      updatePreferences({ [key]: v })
                    }
                    disabled={isUpdating}
                    aria-label={`${label} notifications`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Notification types</Label>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Which notifications do you want to receive?
          </p>
          <div className="space-y-3">
            {CATEGORIES.map(({ key, label }) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <Label htmlFor={`cat-${key}`} className="text-sm font-normal cursor-pointer">
                  {label}
                </Label>
                <Switch
                  id={`cat-${key}`}
                  checked={preferences.categories[key]}
                  onCheckedChange={(v) =>
                    updatePreferences({
                      categories: {
                        ...preferences.categories,
                        [key]: v,
                      },
                    })
                  }
                  disabled={isUpdating}
                  aria-label={`${label}`}
                />
              </div>
            ))}
          </div>
        </div>

        {preferences.push_enabled && preferences.push_token_status === 'denied' && (
          <div
            className={cn(
              'rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3',
              'text-sm text-amber-800 dark:text-amber-200'
            )}
          >
            Push permission was denied. Enable notifications in your device settings to receive reminders.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
