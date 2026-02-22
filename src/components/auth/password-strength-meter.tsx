import { cn } from '@/lib/utils'
import { calculatePasswordStrength, type PasswordStrength } from '@/lib/password-strength'

export interface PasswordStrengthMeterProps {
  password: string
  className?: string
  id?: string
}

const strengthConfig: Record<
  PasswordStrength,
  { color: string; percent: number; label: string }
> = {
  weak: { color: 'bg-destructive', percent: 33, label: 'Weak' },
  ok: { color: 'bg-amber-500', percent: 66, label: 'OK' },
  strong: { color: 'bg-secondary', percent: 100, label: 'Strong' },
}

export function PasswordStrengthMeter({ password, className, id }: PasswordStrengthMeterProps) {
  if (!password) return null

  const result = calculatePasswordStrength(password)
  const config = strengthConfig[result.label]

  return (
    <div id={id} className={cn('space-y-2', className)} aria-live="polite">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Password strength</span>
        <span
          className={cn(
            'text-xs font-medium',
            result.label === 'weak' && 'text-destructive',
            result.label === 'ok' && 'text-amber-600',
            result.label === 'strong' && 'text-secondary'
          )}
        >
          {config.label}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out',
            config.color
          )}
          style={{ width: `${config.percent}%` }}
        />
      </div>
      <ul
        className="text-xs text-muted-foreground space-y-1"
        aria-label="Password requirements"
      >
        <li className={result.meetsMinLength ? 'text-secondary' : ''}>
          {result.meetsMinLength ? '✓' : '○'} At least 12 characters
        </li>
        <li className={result.hasLetter ? 'text-secondary' : ''}>
          {result.hasLetter ? '✓' : '○'} At least one letter
        </li>
        <li className={result.hasDigit ? 'text-secondary' : ''}>
          {result.hasDigit ? '✓' : '○'} At least one number
        </li>
        <li className={result.hasSpecial ? 'text-secondary' : ''}>
          {result.hasSpecial ? '✓' : '○'} Special characters recommended
        </li>
      </ul>
    </div>
  )
}
