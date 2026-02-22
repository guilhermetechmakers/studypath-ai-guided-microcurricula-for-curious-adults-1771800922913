import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CollapsibleContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

interface CollapsibleProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )
  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: setOpen }}>
      <div className={cn(className)} data-state={open ? 'open' : 'closed'}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

function CollapsibleTrigger({ children, className, ...props }: CollapsibleTriggerProps) {
  const ctx = React.useContext(CollapsibleContext)
  if (!ctx) throw new Error('CollapsibleTrigger must be used within Collapsible')
  return (
    <button
      type="button"
      onClick={() => ctx.onOpenChange(!ctx.open)}
      className={cn(
        'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      aria-expanded={ctx.open}
      {...props}
    >
      {children}
      <ChevronDown
        className={cn('h-4 w-4 shrink-0 transition-transform duration-200', ctx.open && 'rotate-180')}
      />
    </button>
  )
}

interface CollapsibleContentProps {
  children: React.ReactNode
  className?: string
}

function CollapsibleContent({ children, className }: CollapsibleContentProps) {
  const ctx = React.useContext(CollapsibleContext)
  if (!ctx) throw new Error('CollapsibleContent must be used within Collapsible')
  if (!ctx.open) return null
  return <div className={cn('overflow-hidden', className)}>{children}</div>
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
