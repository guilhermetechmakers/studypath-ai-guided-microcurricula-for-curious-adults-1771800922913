import { useState } from 'react'
import { TrendingUp, Clock, Target, Flame } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUserAnalytics, useNextSessions } from '@/hooks/use-settings'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

const RANGE_OPTIONS = [
  { id: '7d' as const, label: '7 days' },
  { id: '30d' as const, label: '30 days' },
  { id: '90d' as const, label: '90 days' },
]

export function ProgressAnalyticsPanel() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('30d')
  const { data: analytics, isLoading } = useUserAnalytics(range)
  const { data: nextSessions } = useNextSessions()

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  const period = analytics.byPeriod?.[range]
  const lessonsCompleted = period?.lessonsCompleted ?? analytics.lessonsCompleted
  const minutesStudied = period?.minutesStudied ?? analytics.minutesStudied

  const chartData = [
    { name: 'Lessons', value: lessonsCompleted, fill: 'rgb(var(--accent))' },
    { name: 'Minutes', value: Math.round(minutesStudied / 10), fill: 'rgb(var(--secondary))' },
  ]

  return (
    <div className="space-y-6 animate-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Progress & Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Your study metrics and upcoming sessions
          </p>
        </div>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((r) => (
            <Button
              key={r.id}
              variant={range === r.id ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-accent/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Lessons completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{lessonsCompleted}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Minutes studied
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{Math.round(minutesStudied)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Flame className="h-4 w-4" />
              Streak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{analytics.streakDays} days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{analytics.milestonesReached}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity</CardTitle>
          <CardDescription>
            Overview for the selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {nextSessions && nextSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming sessions</CardTitle>
            <CardDescription>
              Spaced review and scheduled study
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {nextSessions.slice(0, 5).map((s) => (
                <li
                  key={s.id}
                  className="flex justify-between items-center py-2 border-b border-border last:border-0"
                >
                  <span className="font-medium">{s.lessonTitle}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(s.scheduledTime).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
