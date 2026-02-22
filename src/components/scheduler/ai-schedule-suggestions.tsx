import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sparkles, Check, Pencil } from 'lucide-react'
import { useScheduleSuggestions, useCreateSessions } from '@/hooks/use-scheduler'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function formatSuggestionDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function AIScheduleSuggestions() {
  const { data, isLoading, refetch } = useScheduleSuggestions(14)
  const createSessions = useCreateSessions()

  const suggestions = data?.suggestions ?? []
  const rationale = data?.rationale

  const handleAcceptAll = async () => {
    const valid = suggestions.filter((s) => s.curriculum_id && s.lesson_id)
    if (valid.length === 0) {
      toast.info('No suggestions to accept')
      return
    }
    const payload = valid.map((s, i) => ({
      idempotency_key: `accept-${Date.now()}-${i}`,
      curriculum_id: s.curriculum_id!,
      lesson_id: s.lesson_id!,
      scheduled_at: s.suggested_at,
      duration_minutes: s.duration_minutes,
      source: 'ai' as const,
    }))
    await createSessions.mutateAsync({ sessions: payload })
    refetch()
  }

  if (isLoading) {
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
    <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent transition-shadow duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base uppercase tracking-wide">
          <Sparkles className="h-5 w-5 text-accent" />
          AI schedule suggestions
        </CardTitle>
        <CardDescription>
          Personalized schedule based on your availability and spaced review intervals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="rounded-lg border border-dashed py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No suggestions yet. Set your weekly availability and preferences to get AI-generated schedules.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => refetch()}
            >
              Refresh suggestions
            </Button>
          </div>
        ) : (
          <>
            {rationale?.spaced_review && rationale.spaced_review.length > 0 && (
              <div className="rounded-lg bg-accent/10 p-3 text-sm">
                <p className="font-medium text-accent mb-1">Spaced review rationale</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  {rationale.spaced_review.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              {suggestions.slice(0, 7).map((s, i) => (
                <div
                  key={`${s.curriculum_id}-${s.lesson_id}-${s.suggested_at}`}
                  className={cn(
                    'flex flex-col sm:flex-row sm:items-center justify-between gap-2',
                    'rounded-lg border p-3 animate-in'
                  )}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div>
                    <p className="font-medium text-sm">
                      {s.lesson_title ?? s.lesson_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatSuggestionDate(s.suggested_at)} · {s.duration_minutes} min
                    </p>
                    {s.reason_text && (
                      <p className="text-xs text-accent mt-1">{s.reason_text}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                size="sm"
                onClick={handleAcceptAll}
                disabled={createSessions.isPending}
                className="transition-transform hover:scale-105"
              >
                <Check className="h-4 w-4 mr-1" />
                {createSessions.isPending ? 'Scheduling...' : 'Accept all'}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => refetch()}
                disabled={createSessions.isPending}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
