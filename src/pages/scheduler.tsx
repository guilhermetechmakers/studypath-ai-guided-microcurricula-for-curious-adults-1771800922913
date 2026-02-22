import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell } from 'lucide-react'

const mockUpcoming = [
  { id: '1', title: 'History of Troy - Lesson 2', date: 'Tomorrow, 9:00 AM', minutes: 20 },
  { id: '2', title: 'History of Troy - Lesson 3', date: 'Wed, 7:00 PM', minutes: 18 },
]

export function SchedulerPage() {
  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Scheduler</h1>
        <p className="text-muted-foreground mt-1">Manage study sessions and reminders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Upcoming sessions
          </CardTitle>
          <CardDescription>Your scheduled study sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockUpcoming.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.date} · {s.minutes} min</p>
                </div>
                <Button size="sm">Start</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly availability</CardTitle>
          <CardDescription>Set when you prefer to study</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure your preferred study times. Sessions will be scheduled based on your availability.
          </p>
          <Button variant="secondary" className="mt-4">Edit availability</Button>
        </CardContent>
      </Card>
    </div>
  )
}
