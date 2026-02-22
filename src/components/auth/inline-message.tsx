import { cn } from '@/lib/utils'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

export type InlineMessageVariant = 'success' | 'error' | 'neutral'

export interface InlineMessageProps {
  variant: InlineMessageVariant
  message: string
  className?: string
  id?: string
}

const variantConfig = {
  success: {
    icon: CheckCircle2,
    className: 'bg-secondary/10 border-secondary/30 text-secondary-foreground',
    iconClassName: 'text-secondary',
  },
  error: {
    icon: AlertCircle,
    className: 'bg-destructive/10 border-destructive/30 text-destructive',
    iconClassName: 'text-destructive',
  },
  neutral: {
    icon: Info,
    className: 'bg-muted/30 border-border text-muted-foreground',
    iconClassName: 'text-muted-foreground',
  },
}

export function InlineMessage({
  variant,
  message,
  className,
  id,
}: InlineMessageProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 transition-all duration-200',
        config.className,
        className
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', config.iconClassName)} aria-hidden />
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  )
}
