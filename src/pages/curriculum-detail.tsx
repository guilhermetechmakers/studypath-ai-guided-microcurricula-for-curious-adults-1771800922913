import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GripVertical, ChevronDown, ChevronRight, Pencil, Share2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Curriculum } from '@/types/curriculum'

const mockCurriculum: Curriculum = {
  id: '1',
  title: 'History of Troy',
  description: 'From myth to archaeology',
  chapters: [
    {
      id: 'c1',
      title: 'Mythological foundations',
      order: 0,
      lessons: [
        { id: 'l1', title: 'Homer and the Iliad', content: '...', estimatedMinutes: 15 },
        { id: 'l2', title: 'The Trojan War in myth', content: '...', estimatedMinutes: 20 },
      ],
    },
    {
      id: 'c2',
      title: 'Archaeological discovery',
      order: 1,
      lessons: [
        { id: 'l3', title: 'Heinrich Schliemann', content: '...', estimatedMinutes: 18 },
        { id: 'l4', title: 'Troy today', content: '...', estimatedMinutes: 12 },
      ],
    },
  ],
  totalEstimatedMinutes: 65,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export function CurriculumDetailPage() {
  const { id } = useParams()
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set(['c1']))

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev)
      if (next.has(chapterId)) next.delete(chapterId)
      else next.add(chapterId)
      return next
    })
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{mockCurriculum.title}</h1>
          <p className="text-muted-foreground mt-1">
            {mockCurriculum.chapters.length} chapters · {mockCurriculum.totalEstimatedMinutes} min total
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chapters</CardTitle>
          <p className="text-sm text-muted-foreground">
            Click a lesson to start studying. Drag to reorder.
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockCurriculum.chapters.map((chapter) => {
            const isExpanded = expandedChapters.has(chapter.id)
            const lessonCount = chapter.lessons.length
            const chapterMinutes = chapter.lessons.reduce((s, l) => s + l.estimatedMinutes, 0)
            return (
              <div
                key={chapter.id}
                className="border rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  className="w-full flex items-center gap-2 p-4 text-left hover:bg-accent/5 transition-colors"
                  onClick={() => toggleChapter(chapter.id)}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  )}
                  <span className="font-medium flex-1">{chapter.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {lessonCount} lessons · {chapterMinutes} min
                  </span>
                </button>
                {isExpanded && (
                  <div className="border-t bg-muted/5">
                    {chapter.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        to={`/dashboard/curricula/${id}/lesson/${lesson.id}`}
                        className="flex items-center gap-2 px-4 py-3 pl-12 hover:bg-accent/5 transition-colors"
                      >
                        <span className="flex-1">{lesson.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {lesson.estimatedMinutes} min
                        </span>
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
