import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

interface GenerateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: 'idle' | 'queued' | 'running' | 'succeeded' | 'failed'
  progressMessages: string[]
  progressPercent?: number
  onCancel?: () => void
  children?: React.ReactNode
  error?: string | null
}

export function GenerateModal({
  open,
  onOpenChange,
  status,
  progressMessages,
  progressPercent = 0,
  onCancel,
  children,
  error,
}: GenerateModalProps) {
  const isRunning = status === 'running' || status === 'queued'
  const isFailed = status === 'failed'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] flex flex-col"
        aria-describedby="generate-modal-description"
        aria-labelledby="generate-modal-title"
      >
        <DialogHeader>
          <DialogTitle id="generate-modal-title">
            {isRunning && 'Generating your curriculum'}
            {status === 'succeeded' && 'Generation complete'}
            {isFailed && 'Generation failed'}
          </DialogTitle>
          <DialogDescription id="generate-modal-description">
            {isRunning &&
              'Building chapters and lessons. This may take a minute...'}
            {status === 'succeeded' && 'Your curriculum is ready to preview and edit.'}
            {isFailed && 'Something went wrong. Please try again.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-4">
          {isRunning && (
            <div className="space-y-2">
              <Progress value={progressPercent} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {progressMessages[progressMessages.length - 1] ?? 'Starting...'}
              </p>
            </div>
          )}

          {error && (
            <div
              className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="h-[280px] overflow-y-auto rounded-lg border">
            <div className="p-4 space-y-4" aria-live="polite">
              {isRunning && !children && (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <div className="space-y-2 pl-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-6 w-4/5" />
                  </div>
                  <Skeleton className="h-8 w-2/3" />
                  <div className="space-y-2 pl-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-4/5" />
                  </div>
                </div>
              )}
              {children}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {isRunning && onCancel && (
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            )}
            {status === 'succeeded' && (
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            )}
            {isFailed && (
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
