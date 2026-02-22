import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Eye,
  Pencil,
  Calendar,
  RefreshCw,
  Trash2,
  MoreHorizontal,
  Image,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Curriculum, Chapter, Lesson } from '@/types/curriculum'

interface CurriculumPreviewTreeProps {
  curriculum: Curriculum | null
  expandedChapters: Set<string>
  onToggleChapter: (chapterId: string) => void
  onReorderChapters?: (chapters: Chapter[]) => void
  onReorderLessons?: (chapterId: string, lessons: Lesson[]) => void
  onPreviewLesson?: (lesson: Lesson) => void
  onEditLesson?: (lesson: Lesson) => void
  onScheduleLesson?: (lesson: Lesson) => void
  onRewriteLesson?: (lesson: Lesson, type: 'simpler' | 'more_technical' | 'alternate_example') => void
  onRemoveLesson?: (lesson: Lesson) => void
  className?: string
}

function LessonRow({
  lesson,
  onPreview,
  onEdit,
  onSchedule,
  onRewrite,
  onRemove,
}: {
  lesson: Lesson
  onPreview?: (l: Lesson) => void
  onEdit?: (l: Lesson) => void
  onSchedule?: (l: Lesson) => void
  onRewrite?: (l: Lesson, t: 'simpler' | 'more_technical' | 'alternate_example') => void
  onRemove?: (l: Lesson) => void
}) {
  const hasImages = (lesson.imageRequests?.length ?? 0) > 0 || !!lesson.imageUrl
  const hasCitations = (lesson.citations?.length ?? 0) > 0

  return (
    <div
      className="flex items-center gap-2 py-2 pl-8 pr-2 rounded-lg hover:bg-accent/5 group"
      data-lesson-id={lesson.id}
    >
      <span className="flex-1 truncate font-medium text-sm">{lesson.title}</span>
      <span className="text-xs text-muted-foreground shrink-0">
        {lesson.estimatedMinutes ?? 15} min
      </span>
      {lesson.tags && lesson.tags.length > 0 && (
        <div className="flex gap-1 shrink-0">
          {lesson.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded px-1.5 py-0.5 text-xs bg-muted/50 text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      {hasImages && <Image className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />}
      {hasCitations && <FileText className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onPreview && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPreview(lesson)}
            aria-label={`Preview ${lesson.title}`}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(lesson)}
            aria-label={`Edit ${lesson.title}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Lesson menu">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onSchedule && (
              <DropdownMenuItem onSelect={() => onSchedule(lesson)}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </DropdownMenuItem>
            )}
            {onRewrite && (
              <>
                <DropdownMenuItem onSelect={() => onRewrite(lesson, 'simpler')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rewrite (Simpler)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onRewrite(lesson, 'more_technical')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rewrite (More technical)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onRewrite(lesson, 'alternate_example')}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Rewrite (Alternate example)
                </DropdownMenuItem>
              </>
            )}
            {onRemove && (
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => onRemove(lesson)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function CurriculumPreviewTree({
  curriculum,
  expandedChapters,
  onToggleChapter,
  onPreviewLesson,
  onEditLesson,
  onScheduleLesson,
  onRewriteLesson,
  onRemoveLesson,
  className,
}: CurriculumPreviewTreeProps) {
  if (!curriculum || !curriculum.chapters?.length) {
    return (
      <div
        className={cn(
          'rounded-xl border border-dashed border-muted-foreground/30 p-8 text-center text-muted-foreground',
          className
        )}
      >
        <p className="text-sm">No curriculum to display. Generate one to get started.</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-1', className)}>
      {curriculum.chapters.map((chapter) => {
        const isExpanded = expandedChapters.has(chapter.id)
        const lessons = chapter.lessons ?? []
        const chapterMinutes = lessons.reduce((s, l) => s + (l.estimatedMinutes ?? 15), 0)

        return (
          <div
            key={chapter.id}
            className="rounded-xl border bg-card overflow-hidden"
          >
            <button
              type="button"
              className="w-full flex items-center gap-2 p-4 text-left hover:bg-accent/5 transition-colors"
              onClick={() => onToggleChapter(chapter.id)}
              aria-expanded={isExpanded}
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
              <span className="font-semibold flex-1">{chapter.title}</span>
              <span className="text-sm text-muted-foreground">
                {lessons.length} lessons · {chapterMinutes} min
              </span>
            </button>
            {isExpanded && (
              <div className="border-t bg-muted/5">
                {lessons.map((lesson) => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    onPreview={onPreviewLesson}
                    onEdit={onEditLesson}
                    onSchedule={onScheduleLesson}
                    onRewrite={onRewriteLesson}
                    onRemove={onRemoveLesson}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
