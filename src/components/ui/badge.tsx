import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-accent/10 text-accent',
        secondary: 'bg-muted/50 text-muted-foreground',
        outline: 'border border-input bg-transparent',
        success: 'bg-secondary/20 text-secondary-foreground',
        intro: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
        intermediate: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
        deep: 'bg-violet-500/15 text-violet-700 dark:text-violet-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
