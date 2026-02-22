import * as React from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/types/curriculum'

export interface LessonPreviewPaneProps {
  lesson: Lesson | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenInViewer?: (lesson: Lesson) => void
  onAskQuestion?: (lesson: Lesson, question: string) => void
  className?: string
}

export function LessonPreviewPane({
  lesson,
  open,
  onOpenChange,
  onOpenInViewer,
  onAskQuestion,
  className,
}: LessonPreviewPaneProps) {
  const [expandedDeep, setExpandedDeep] = React.useState<Set<string>>(new Set())
  const body = lesson?.body ?? lesson?.content ?? ''

  const goDeep: { id: string; title: string; content: string }[] =
    lesson?.goDeep ??
    lesson?.go_deep ??
    (lesson?.goDeeper
      ? [{ id: '1', title: 'Go deeper', content: lesson.goDeeper }]
      : [])

  const toggleDeep = (id: string) => {
    setExpandedDeep((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!lesson) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showClose>
        <DialogHeader>
          <DialogTitle>{lesson.title}</DialogTitle>
        </DialogHeader>
        <div className={cn('space-y-4 py-4', className)}>
          {lesson.objectives?.length ? (
            <div>
              <h4 className="text-sm font-medium mb-2">Learning objectives</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {lesson.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="prose prose-custom max-w-none">
            <div className="whitespace-pre-wrap text-sm">{body}</div>
          </div>
          {lesson.imageUrl && (
            <div>
              <img
                src={lesson.imageUrl}
                alt=""
                className="rounded-lg border border-border max-h-48 object-cover"
              />
            </div>
          )}
          {lesson.imageRequests?.length ? (
            <div>
              <h4 className="text-sm font-medium mb-2">Images</h4>
              <div className="flex gap-2 flex-wrap">
                {lesson.imageRequests.map((ir) => (
                  <div
                    key={ir.id}
                    className="rounded-lg border border-border bg-muted/20 p-3 text-sm"
                  >
                    <p className="text-muted-foreground">
                      {ir.altText ?? ir.alt_text ?? ir.requestPrompt ?? ir.request_prompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {goDeep.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Go deeper</h4>
              <div className="space-y-2">
                {goDeep.map((s) => {
                  const isExpanded = expandedDeep.has(s.id)
                  return (
                    <div
                      key={s.id}
                      className="rounded-lg border border-border overflow-hidden"
                    >
                      <button
                        type="button"
                        className="w-full flex items-center gap-2 p-3 text-left hover:bg-accent/5"
                        onClick={() => toggleDeep(s.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="font-medium text-sm">{s.title}</span>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-3 pt-0 text-sm text-muted-foreground border-t border-border">
                          {s.content}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          {(lesson.microChecks ?? lesson.micro_checks)?.length ? (
            <div>
              <h4 className="text-sm font-medium mb-2">Quick check</h4>
              <div className="space-y-2">
                {(lesson.microChecks ?? lesson.micro_checks ?? []).slice(0, 2).map((mc) => (
                  <div
                    key={mc.id}
                    className="rounded-lg border border-border p-3 text-sm"
                  >
                    <p>{mc.question}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {lesson.citations?.length ? (
            <div>
              <h4 className="text-sm font-medium mb-2">References</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {lesson.citations.map((c) => (
                  <li key={c.id}>
                    {c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:underline"
                      >
                        {c.text}
                      </a>
                    ) : (
                      c.text
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        {(onOpenInViewer || onAskQuestion) && (
          <div className="flex gap-2 pt-4 border-t">
            {onOpenInViewer && (
              <Button
                onClick={() => lesson && onOpenInViewer(lesson)}
              >
                Open in lesson viewer
              </Button>
            )}
            {onAskQuestion && (
              <Button variant="secondary">
                Ask a question
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
