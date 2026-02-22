import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUserPreferences, useNextSessions } from '@/hooks/use-settings'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { LearningDepth, CitationStyle, StudyCadence } from '@/types/settings'

const SESSION_LENGTHS = [15, 25, 45, 60] as const
const DEPTH_OPTIONS: { value: LearningDepth; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'detailed', label: 'Detailed' },
  { value: 'expert', label: 'Expert' },
]
const CITATION_OPTIONS: { value: CitationStyle; label: string }[] = [
  { value: 'apa', label: 'APA' },
  { value: 'mla', label: 'MLA' },
  { value: 'chicago', label: 'Chicago' },
  { value: 'none', label: 'None' },
]
const CADENCE_OPTIONS: { value: StudyCadence; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
]

const schema = z.object({
  sessionLengthMinutes: z.enum(['15', '25', '45', '60']),
  learningDepth: z.enum(['overview', 'detailed', 'expert']),
  citationStyle: z.enum(['apa', 'mla', 'chicago', 'none']),
  studyCadence: z.enum(['daily', 'weekly']),
  priorKnowledgeLevel: z.number().min(0).max(5),
  spacedReviewEnabled: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function LearningPreferencesPanel() {
  const { preferences, isLoading, updatePreferences, isUpdating } =
    useUserPreferences()
  const { data: nextSessions } = useNextSessions()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sessionLengthMinutes: '25',
      learningDepth: 'detailed',
      citationStyle: 'apa',
      studyCadence: 'daily',
      priorKnowledgeLevel: 3,
      spacedReviewEnabled: true,
    },
    values: preferences
      ? {
          sessionLengthMinutes: String(preferences.sessionLengthMinutes) as '15' | '25' | '45' | '60',
          learningDepth: preferences.learningDepth,
          citationStyle: preferences.citationStyle,
          studyCadence: preferences.studyCadence,
          priorKnowledgeLevel: preferences.priorKnowledgeLevel,
          spacedReviewEnabled: preferences.spacedReviewEnabled,
        }
      : undefined,
  })

  const onSubmit = form.handleSubmit(async (values) => {
    await updatePreferences({
      sessionLengthMinutes: Number(values.sessionLengthMinutes) as 15 | 25 | 45 | 60,
      learningDepth: values.learningDepth as LearningDepth,
      citationStyle: values.citationStyle as CitationStyle,
      studyCadence: values.studyCadence as StudyCadence,
      priorKnowledgeLevel: values.priorKnowledgeLevel,
      spacedReviewEnabled: values.spacedReviewEnabled,
    })
  })

  if (isLoading || !preferences) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-semibold">Learning Preferences</h1>
        <p className="text-muted-foreground mt-1">
          Customize how you study and learn
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Session settings</CardTitle>
            <CardDescription>
              Default session length and learning depth
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Session length</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {SESSION_LENGTHS.map((m) => (
                  <label
                    key={m}
                    className={cn(
                      'flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-200',
                      Number(form.watch('sessionLengthMinutes')) === m
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'hover:bg-accent/5'
                    )}
                  >
                    <input
                      type="radio"
                      value={m}
                      {...form.register('sessionLengthMinutes')}
                      className="sr-only"
                    />
                    {m} min
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Learning depth</Label>
              <Select
                value={form.watch('learningDepth')}
                onValueChange={(v) => form.setValue('learningDepth', v as LearningDepth)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPTH_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Citation style</Label>
              <Select
                value={form.watch('citationStyle')}
                onValueChange={(v) => form.setValue('citationStyle', v as CitationStyle)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITATION_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Study cadence</Label>
              <Select
                value={form.watch('studyCadence')}
                onValueChange={(v) => form.setValue('studyCadence', v as StudyCadence)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CADENCE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prior knowledge</CardTitle>
            <CardDescription>
              How familiar are you with the topics? (0 = beginner, 5 = expert)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Slider
                value={[form.watch('priorKnowledgeLevel')]}
                onValueChange={([v]) => form.setValue('priorKnowledgeLevel', v)}
                min={0}
                max={5}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium w-8">
                {form.watch('priorKnowledgeLevel')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spaced review</CardTitle>
            <CardDescription>
              Get reminders to review past lessons at optimal intervals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="spaced-review">Enable spaced review</Label>
              <Switch
                id="spaced-review"
                checked={form.watch('spacedReviewEnabled')}
                onCheckedChange={(v) => form.setValue('spacedReviewEnabled', v)}
              />
            </div>
          </CardContent>
        </Card>

        {nextSessions && nextSessions.length > 0 && (
          <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader>
              <CardTitle>Upcoming sessions</CardTitle>
              <CardDescription>
                Your next suggested study sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {nextSessions.slice(0, 3).map((s) => (
                  <li
                    key={s.id}
                    className="flex justify-between text-sm py-2 border-b border-border last:border-0"
                  >
                    <span>{s.lessonTitle}</span>
                    <span className="text-muted-foreground">
                      {new Date(s.scheduledTime).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? 'Saving...' : 'Save preferences'}
        </Button>
      </form>
    </div>
  )
}
