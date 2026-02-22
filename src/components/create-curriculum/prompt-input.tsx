import { ChevronDown, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const PROMPT_EXAMPLES = [
  'I want to learn the history of Troy after watching the movie Troy',
  'Explain quantum computing basics for a software engineer',
  'Introduction to ancient Roman architecture and engineering',
  'Learn the fundamentals of machine learning from scratch',
]

const CONTEXT_CHIP_OPTIONS = [
  { key: 'watched-troy', label: 'Watched: Troy' },
  { key: 'watched-documentary', label: 'Watched: Documentary' },
  { key: 'read-iliad', label: 'Read: Iliad' },
  { key: 'background-none', label: 'Background: None' },
  { key: 'background-history', label: 'Background: History' },
  { key: 'background-science', label: 'Background: Science' },
]

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  contextChips: { key: string; label: string }[]
  onAddContextChip: (key: string, label: string) => void
  onRemoveContextChip: (key: string) => void
  onPasteContext?: () => void
  error?: string
  disabled?: boolean
  minLength?: number
  maxLength?: number
  placeholder?: string
  className?: string
}

export function PromptInput({
  value,
  onChange,
  contextChips,
  onAddContextChip,
  onRemoveContextChip,
  onPasteContext,
  error,
  disabled = false,
  minLength = 15,
  maxLength = 2000,
  placeholder = 'e.g., I want to learn the history of Troy after watching the movie Troy',
  className,
}: PromptInputProps) {
  const charCount = value.length
  const isValid = value.length >= minLength
  const isOverMax = value.length > maxLength

  return (
    <div className={cn('space-y-3', className)}>
      <div className="space-y-2">
        <label htmlFor="prompt-input" className="text-sm font-medium">
          What do you want to learn?
        </label>
        <Textarea
          id="prompt-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={5}
          disabled={disabled}
          maxLength={maxLength}
          className={cn(
            'min-h-[120px] resize-y transition-colors duration-200',
            error && 'border-destructive focus-visible:ring-destructive',
            isOverMax && 'border-amber-500'
          )}
          aria-invalid={!!error}
          aria-describedby={error ? 'prompt-error' : 'prompt-hint'}
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="secondary" size="sm" disabled={disabled}>
                  Examples
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-72">
                {PROMPT_EXAMPLES.map((ex) => (
                  <DropdownMenuItem
                    key={ex}
                    onSelect={() => onChange(ex)}
                    className="cursor-pointer"
                  >
                    <span className="line-clamp-2 text-left">{ex}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {onPasteContext && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onPasteContext}
                disabled={disabled}
              >
                <FileText className="h-4 w-4 mr-1" />
                Paste current lesson/context
              </Button>
            )}
          </div>
          <span
            id="prompt-hint"
            className={cn(
              'text-xs',
              isOverMax ? 'text-amber-600' : 'text-muted-foreground'
            )}
          >
            {charCount}/{maxLength}
          </span>
        </div>
        {error && (
          <p id="prompt-error" className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {!error && !isValid && charCount > 0 && (
          <p className="text-sm text-muted-foreground">
            Enter at least {minLength} characters
          </p>
        )}
      </div>

      {/* Context chips */}
      <div className="space-y-2">
        <span className="text-sm font-medium">Context toggles</span>
        <div className="flex flex-wrap gap-2">
          {CONTEXT_CHIP_OPTIONS.map((opt) => {
            const isActive = contextChips.some((c) => c.key === opt.key)
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() =>
                  isActive ? onRemoveContextChip(opt.key) : onAddContextChip(opt.key, opt.label)
                }
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200',
                  'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-background text-muted-foreground hover:border-accent/50 hover:bg-accent/5'
                )}
                aria-pressed={isActive}
                aria-label={`${opt.label} ${isActive ? 'selected' : 'not selected'}`}
              >
                {opt.label}
                {isActive && <X className="h-3 w-3" />}
              </button>
            )
          })}
        </div>
        {contextChips.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Selected: {contextChips.map((c) => c.label).join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}
