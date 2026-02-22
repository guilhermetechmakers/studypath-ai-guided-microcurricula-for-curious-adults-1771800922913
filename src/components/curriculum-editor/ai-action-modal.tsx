import * as React from 'react'
import { Loader2, Check, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Lesson } from '@/types/curriculum'

export type AiActionType = 'rewrite' | 'qa'

export type RewriteTone = 'simpler' | 'more_technical' | 'concise'

interface AiActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lesson: Lesson | null
  actionType: AiActionType
  rewriteTone?: RewriteTone
  isLoading?: boolean
  result?: string
  error?: string
  onAccept?: (result: string) => void
  onReject?: () => void
  onSubmitQa?: (question: string) => void
  onSubmitRewrite?: (tone: RewriteTone) => void
}

export function AiActionModal({
  open,
  onOpenChange,
  lesson,
  actionType,
  rewriteTone = 'simpler',
  isLoading = false,
  result,
  error,
  onAccept,
  onReject,
  onSubmitQa,
  onSubmitRewrite,
}: AiActionModalProps) {
  const [question, setQuestion] = React.useState('')
  const [selectedTone, setSelectedTone] = React.useState<RewriteTone>(rewriteTone)

  const handleSubmit = () => {
    if (actionType === 'qa' && question.trim()) {
      onSubmitQa?.(question.trim())
    } else if (actionType === 'rewrite') {
      onSubmitRewrite?.(selectedTone)
    }
  }

  const tones: { value: RewriteTone; label: string }[] = [
    { value: 'simpler', label: 'Simpler' },
    { value: 'more_technical', label: 'More technical' },
    { value: 'concise', label: 'Concise' },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {actionType === 'qa' ? 'Ask AI about this lesson' : 'AI Rewrite'}
          </DialogTitle>
          <DialogDescription>
            {actionType === 'qa'
              ? 'Ask a question and get an answer based on the lesson content.'
              : 'Choose a tone and the AI will rewrite the lesson content.'}
          </DialogDescription>
        </DialogHeader>

        {lesson && (
          <div className="space-y-4">
            {actionType === 'qa' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Your question</label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., Can you explain this concept in simpler terms?"
                  rows={3}
                  disabled={isLoading}
                />
              </div>
            )}

            {actionType === 'rewrite' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Rewrite tone</label>
                <div className="flex gap-2">
                  {tones.map((t) => (
                    <Button
                      key={t.value}
                      variant={selectedTone === t.value ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setSelectedTone(t.value)}
                      disabled={isLoading}
                    >
                      {t.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {!result && !isLoading && (
              <Button
                onClick={handleSubmit}
                disabled={
                  isLoading ||
                  (actionType === 'qa' && !question.trim())
                }
                className="bg-gradient-to-r from-accent to-accent/80"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                <span className="ml-2">
                  {actionType === 'qa' ? 'Ask' : 'Generate rewrite'}
                </span>
              </Button>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {result && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/20 p-4 max-h-64 overflow-y-auto">
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: result }}
                  />
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={onReject}>
                    <X className="h-4 w-4" />
                    <span className="ml-2">Reject</span>
                  </Button>
                  <Button
                    onClick={() => onAccept?.(result)}
                    className="bg-gradient-to-r from-accent to-accent/80"
                  >
                    <Check className="h-4 w-4" />
                    <span className="ml-2">Accept</span>
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        )}

        {isLoading && !result && (
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>AI is working...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
