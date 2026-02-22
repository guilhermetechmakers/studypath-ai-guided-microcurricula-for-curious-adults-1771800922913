import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronLeft, Check, MessageCircle, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'

const mockLesson = {
  id: 'l1',
  title: 'Homer and the Iliad',
  content: `
The Iliad, attributed to Homer, is one of the oldest works of Western literature. Composed around the 8th century BCE, it tells the story of the Trojan War—specifically, a few weeks during the tenth year of the conflict.

**Key themes include:**
- The wrath of Achilles and its consequences
- The role of the gods in human affairs
- Honor, glory, and the warrior code

The poem was likely transmitted orally before being written down. Its formulaic language suggests a long tradition of epic performance.

*Go deeper: The Homeric Question—whether Homer was a single author or a tradition—has fascinated scholars for centuries.*
  `,
  estimatedMinutes: 15,
  citations: [
    { id: '1', text: 'Iliad 1.1', source: 'Homer, Iliad', url: '#' },
  ],
  quiz: [
    {
      id: 'q1',
      question: 'When was the Iliad likely composed?',
      options: ['6th century BCE', '8th century BCE', '5th century BCE'],
      correctIndex: 1,
    },
  ],
}

export function LessonViewerPage() {
  const { curriculumId } = useParams()
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [showGoDeeper, setShowGoDeeper] = useState(false)
  const [qaInput, setQaInput] = useState('')

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/dashboard/curricula/${curriculumId}`}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to curriculum
          </Link>
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>~{mockLesson.estimatedMinutes} min</span>
          <Progress value={40} className="w-24 h-1.5" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Main content */}
        <div className="space-y-6">
          <h1 className="text-2xl sm:text-3xl font-semibold">{mockLesson.title}</h1>

          <div className="prose prose-custom max-w-none">
            {mockLesson.content.split('\n').map((para, i) => {
              if (para.startsWith('**') && para.endsWith('**')) {
                return <p key={i} className="font-semibold mt-4">{para.replace(/\*\*/g, '')}</p>
              }
              if (para.startsWith('- ')) {
                return <li key={i} className="ml-4">{para.slice(2)}</li>
              }
              if (para.startsWith('*') && para.endsWith('*')) {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setShowGoDeeper(!showGoDeeper)}
                    className="block mt-4 text-accent hover:underline text-left"
                  >
                    <BookOpen className="h-4 w-4 inline mr-2" />
                    {showGoDeeper ? 'Hide' : 'Go deeper'}: {para.slice(1, -1)}
                  </button>
                )
              }
              if (para.trim()) {
                return <p key={i} className="mb-4">{para}</p>
              }
              return null
            })}
          </div>

          {mockLesson.citations && mockLesson.citations.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Citations</h3>
              <ul className="space-y-1 text-sm font-mono">
                {mockLesson.citations.map((c) => (
                  <li key={c.id}>
                    <a href={c.url} className="text-accent hover:underline">{c.text}</a> — {c.source}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mockLesson.quiz && mockLesson.quiz.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Quick check</h3>
                <p className="text-sm text-muted-foreground mb-4">{mockLesson.quiz[0].question}</p>
                <div className="space-y-2">
                  {mockLesson.quiz[0].options.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuizAnswer(i)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        quizAnswer === i
                          ? 'border-accent bg-accent/10'
                          : 'hover:bg-accent/5'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4 pt-4">
            <Button variant="secondary" asChild>
              <Link to={`/dashboard/curricula/${curriculumId}/lesson/prev`}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Link>
            </Button>
            <Button asChild>
              <Link to={`/dashboard/curricula/${curriculumId}/lesson/next`}>
                Mark complete & next
                <Check className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Q&A sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium flex items-center gap-2 mb-4">
                <MessageCircle className="h-4 w-4" />
                Ask about this lesson
              </h3>
              <Input
                placeholder="Ask a question..."
                value={qaInput}
                onChange={(e) => setQaInput(e.target.value)}
                className="mb-2"
              />
              <p className="text-xs text-muted-foreground">
                AI will answer based on the lesson content.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
