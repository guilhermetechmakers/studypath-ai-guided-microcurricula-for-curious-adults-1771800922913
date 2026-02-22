import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { CurriculumParameters } from '@/types/curriculum'
import { AdvancedOptionsPanel } from './advanced-options-panel'

const FOCUS_OPTIONS = [
  { id: 'evidence', label: 'Evidence' },
  { id: 'literary-analysis', label: 'Literary analysis' },
  { id: 'archaeology', label: 'Archaeology' },
  { id: 'methods', label: 'Methods' },
  { id: 'historical-context', label: 'Historical context' },
  { id: 'primary-sources', label: 'Primary sources' },
]

interface SettingsPanelProps {
  params: CurriculumParameters
  onChange: (params: Partial<CurriculumParameters>) => void
  estimatedLessons?: number
  estimatedHours?: number
  className?: string
}

export function SettingsPanel({
  params,
  onChange,
  estimatedLessons = 0,
  estimatedHours = 0,
  className,
}: SettingsPanelProps) {
  const sessionMinutes = params.session_length_minutes ?? 30
  const durationWeeks = params.duration_weeks ?? 4
  const depth = params.depth ?? 50
  const focusTags = params.focus_tags ?? []
  const priorKnowledge = params.prior_knowledge ?? 'beginner'

  const toggleFocus = (id: string) => {
    const next = focusTags.includes(id) ? focusTags.filter((f) => f !== id) : [...focusTags, id]
    onChange({ focus_tags: next })
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <h3 className="text-sm font-semibold mb-4">Settings</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="session-length">Session length (minutes)</Label>
            <Input
              id="session-length"
              type="number"
              min={5}
              max={240}
              value={sessionMinutes}
              onChange={(e) =>
                onChange({ session_length_minutes: Math.min(240, Math.max(5, Number(e.target.value))) })
              }
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">5–240 minutes</p>
          </div>
          <div>
            <Label htmlFor="duration-weeks">Total duration (weeks)</Label>
            <Input
              id="duration-weeks"
              type="number"
              min={1}
              max={104}
              value={durationWeeks}
              onChange={(e) =>
                onChange({ duration_weeks: Math.min(104, Math.max(1, Number(e.target.value))) })
              }
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">1–104 weeks</p>
          </div>
          <div>
            <Label>Depth: {depth < 33 ? 'Overview' : depth < 66 ? 'Balanced' : 'Deep'}</Label>
            <Slider
              value={[depth]}
              onValueChange={([v]) => onChange({ depth: v })}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>
          <div>
            <Label>Focus areas</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {FOCUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleFocus(opt.id)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200',
                    'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    focusTags.includes(opt.id)
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-background hover:border-accent/50'
                  )}
                  aria-pressed={focusTags.includes(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="prior-knowledge">Prior knowledge</Label>
            <Select
              value={priorKnowledge}
              onValueChange={(v) =>
                onChange({
                  prior_knowledge: v as CurriculumParameters['prior_knowledge'],
                })
              }
            >
              <SelectTrigger id="prior-knowledge" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {(estimatedLessons > 0 || estimatedHours > 0) && (
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">Estimated</p>
          <p className="text-2xl font-semibold text-accent mt-1">
            ~{estimatedLessons} lessons · ~{estimatedHours}h total
          </p>
        </div>
      )}

      <AdvancedOptionsPanel
        options={params.advanced_options}
        onChange={(opts) => onChange({ advanced_options: { ...params.advanced_options, ...opts } })}
      />
    </div>
  )
}
