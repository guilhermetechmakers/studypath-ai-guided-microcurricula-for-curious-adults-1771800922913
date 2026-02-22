import { WeeklyAvailabilityMatrix } from '@/components/scheduler/weekly-availability-matrix'
import { SessionDefaults } from '@/components/scheduler/session-defaults'
import { NotificationPreferences } from '@/components/scheduler/notification-preferences'
import { UpcomingSessionsList } from '@/components/scheduler/upcoming-sessions-list'
import { AIScheduleSuggestions } from '@/components/scheduler/ai-schedule-suggestions'
import { HistoryTimeline } from '@/components/scheduler/history-timeline'

export function SchedulerPage() {
  return (
    <div className="space-y-8 animate-in">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">
          Notifications & Scheduler
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage study reminders, weekly availability, session scheduling, and notification preferences.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <WeeklyAvailabilityMatrix />
          <SessionDefaults />
          <NotificationPreferences />
        </div>
        <div className="space-y-6">
          <UpcomingSessionsList />
          <AIScheduleSuggestions />
          <HistoryTimeline />
        </div>
      </div>
    </div>
  )
}
