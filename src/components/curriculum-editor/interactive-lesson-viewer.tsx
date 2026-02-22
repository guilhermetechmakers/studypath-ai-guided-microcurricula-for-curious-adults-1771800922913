import * as React from 'react'
import { ChevronLeft, ChevronRight, Check, MessageCircle, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/types/curriculum'

interface InteractiveLessonViewerProps {
  lesson: Lesson | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPrev?: () => void
  onNext?: () => void
  onMarkComplete?: () => void
  onAskAi?: (question: string) => void | Promise<string>
  qaAnswer?: string | null
  isAskingQa?: boolean
  progressPercent?: number
  className?: string
}

export function InteractiveLessonViewer({
  lesson,
  open,
  onOpenChange,
  onPrev,
  onNext,
  onMarkComplete,
  onAskAi,
  qaAnswer: qaAnswerProp,
  isAskingQa = false,
  progressPercent = 0,
  className,
}: InteractiveLessonViewerProps) {
  const [showGoDeeper, setShowGoDeeper] = React.useState(false)
  const [qaInput, setQaInput] = React.useState('')
  const [localAnswer, setLocalAnswer] = React.useState<string | null>(null)

  const qaAnswer = qaAnswerProp ?? localAnswer

  React.useEffect(() => {
    if (!open) {
      setShowGoDeeper(false)
      setQaInput('')
      setLocalAnswer(null)
    }
  }, [open])

  const handleAsk = async () => {
    if (!qaInput.trim() || !onAskAi) return
    try {
      const result = await onAskAi(qaInput.trim())
      if (typeof result === 'string') setLocalAnswer(result)
    } catch {
      setLocalAnswer('Sorry, something went wrong.')
    }
  }

  const content = lesson?.body ?? lesson?.content ?? ''
  const goDeep = lesson?.goDeep ?? lesson?.go_deep ?? []
  const hasGoDeeper = goDeep.length > 0 || !!lesson?.goDeeper
  const citations = lesson?.citations ?? []
  const quiz = lesson?.quiz ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-4xl max-h-[90vh] overflow-y-auto p-0',
          className
        )}
      >
        {lesson && (
          <>
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl">{lesson.title}</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>~{lesson.estimatedMinutes ?? 15} min</span>
                <Progress value={progressPercent} className="w-24 h-1.5" />
              </div>

              <div
                className="prose prose-custom max-w-none prose-headings:font-semibold"
                dangerouslySetInnerHTML={{
                  __html: content.includes('<') ? content : `<p>${content.replace(/\n/g, '</p><p>')}</p>`,
                }}
              />

              {hasGoDeeper && (
                <Card>
                  <CardContent className="pt-6">
                    <button
                      type="button"
                      onClick={() => setShowGoDeeper(!showGoDeeper)}
                      className="flex items-center gap-2 text-accent hover:underline"
                    >
                      <BookOpen className="h-4 w-4" />
                      {showGoDeeper ? 'Hide' : 'Go deeper'}
                    </button>
                    {showGoDeeper && (
                      <div className="mt-4 space-y-4">
                        {goDeep.map((g) => (
                          <div key={g.id}>
                            <h4 className="font-medium">{g.title}</h4>
                            <p className="text-sm text-muted-foreground">{g.content}</p>
                          </div>
                        ))}
                        {lesson.goDeeper && (
                          <p className="text-sm text-muted-foreground">{lesson.goDeeper}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {citations.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Citations</h3>
                  <ul className="space-y-1 text-sm">
                    {citations.map((c) => (
                      <li key={c.id}>
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          {c.text}
                        </a>
                        {c.source && ` — ${c.source}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {quiz && quiz.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium mb-4">Quick check</h3>
                    <p className="text-sm text-muted-foreground mb-4">{quiz[0].question}</p>
                    <div className="space-y-2">
                      {(quiz[0].options ?? []).map((opt, i) => (
                        <button
                          key={i}
                          type="button"
                          className="w-full text-left p-3 rounded-lg border hover:bg-accent/5 transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {onAskAi && (
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="font-medium flex items-center gap-2 mb-4">
                      <MessageCircle className="h-4 w-4" />
                      Ask about this lesson
                    </h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask a question..."
                        value={qaInput}
                        onChange={(e) => setQaInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                        disabled={isAskingQa}
                      />
                      <Button onClick={handleAsk} disabled={isAskingQa || !qaInput.trim()}>
                        {isAskingQa ? 'Asking...' : 'Ask'}
                      </Button>
                    </div>
                    {qaAnswer && (
                      <div className="mt-4 p-4 rounded-lg bg-muted/20 text-sm">
                        {qaAnswer}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4 pt-4">
                {onPrev && (
                  <Button variant="secondary" onClick={onPrev}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                )}
                {onNext && (
                  <Button onClick={onNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                {onMarkComplete && (
                  <Button onClick={onMarkComplete}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark complete
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
