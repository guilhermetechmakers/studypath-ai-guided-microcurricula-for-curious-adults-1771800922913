import * as React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Pencil,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { LessonCard } from './lesson-card'
import { cn } from '@/lib/utils'
import type { Chapter, Lesson, Curriculum } from '@/types/curriculum'

interface ChapterListProps {
  curriculum: Curriculum
  expandedChapters: Set<string>
  selectedLessonId: string | null
  onToggleChapter: (chapterId: string) => void
  onReorder: (chapters: Chapter[]) => void
  onEditLesson: (lesson: Lesson) => void
  onAiRewriteLesson?: (lesson: Lesson, type: 'simpler' | 'more_technical' | 'concise') => void
  onOpenViewer: (lesson: Lesson) => void
  onAddChapter: () => void
  onRenameChapter: (chapterId: string, title: string) => void
  onDeleteChapter: (chapterId: string) => void
  onAddLesson: (chapterId: string) => void
  onDeleteLesson: (lesson: Lesson) => void
  className?: string
}

function SortableChapterItem({
  chapter,
  isExpanded,
  selectedLessonId,
  onToggle,
  onEditLesson,
  onAiRewriteLesson,
  onOpenViewer,
  onRename,
  onDelete,
  onAddLesson,
  onDeleteLesson,
}: {
  chapter: Chapter
  isExpanded: boolean
  selectedLessonId: string | null
  onToggle: () => void
  onEditLesson: (l: Lesson) => void
  onAiRewriteLesson?: (l: Lesson, t: 'simpler' | 'more_technical' | 'concise') => void
  onOpenViewer: (l: Lesson) => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
  onAddLesson: (chapterId: string) => void
  onDeleteLesson: (l: Lesson) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(chapter.title)

  const lessons = chapter.lessons ?? []
  const chapterMins = lessons.reduce((s, l) => s + (l.estimatedMinutes ?? 15), 0)

  const handleRename = () => {
    setIsEditing(false)
    if (editValue.trim() && editValue !== chapter.title) {
      onRename(chapter.id, editValue.trim())
    } else {
      setEditValue(chapter.title)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-xl border bg-card overflow-hidden transition-all duration-200',
        isDragging && 'opacity-80 shadow-lg z-10'
      )}
    >
      <div className="flex items-center gap-2 p-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-accent/10 active:cursor-grabbing"
          aria-label="Drag to reorder chapter"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 flex items-center gap-2 text-left min-w-0"
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          {isEditing ? (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              className="h-8 text-sm font-medium flex-1"
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <span className="font-semibold truncate">{chapter.title}</span>
          )}
          <span className="text-sm text-muted-foreground shrink-0">
            {lessons.length} lessons · {chapterMins} min
          </span>
        </button>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            aria-label={`Rename ${chapter.title}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onAddLesson(chapter.id)
            }}
            aria-label="Add lesson"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
                aria-label="Chapter menu"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => onDelete(chapter.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete chapter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {isExpanded && (
        <div className="border-t bg-muted/5 p-2 space-y-2">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isSelected={selectedLessonId === lesson.id}
              onEdit={() => onEditLesson(lesson)}
              onAiRewrite={
                onAiRewriteLesson
                  ? (t) => onAiRewriteLesson(lesson, t)
                  : undefined
              }
              onOpenViewer={() => onOpenViewer(lesson)}
              onRemove={() => onDeleteLesson(lesson)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function ChapterList({
  curriculum,
  expandedChapters,
  selectedLessonId,
  onToggleChapter,
  onReorder,
  onEditLesson,
  onAiRewriteLesson,
  onOpenViewer,
  onAddChapter,
  onRenameChapter,
  onDeleteChapter,
  onAddLesson,
  onDeleteLesson,
  className,
}: ChapterListProps) {
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ chapterId: string; title: string } | null>(null)

  const chapters = curriculum.chapters ?? []
  const chapterIds = chapters.map((c) => c.id)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = chapterIds.indexOf(active.id as string)
    const newIndex = chapterIds.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(chapters, oldIndex, newIndex)
    onReorder(reordered)
  }

  const handleDeleteChapter = (chapterId: string) => {
    const ch = chapters.find((c) => c.id === chapterId)
    if (ch) {
      setDeleteConfirm({ chapterId, title: ch.title })
    }
  }

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDeleteChapter(deleteConfirm.chapterId)
      setDeleteConfirm(null)
    }
  }

  return (
    <>
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Chapters</h3>
          <Button variant="secondary" size="sm" onClick={onAddChapter}>
            <Plus className="h-4 w-4" />
            <span className="ml-2">Add chapter</span>
          </Button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={chapterIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {chapters.map((chapter) => (
                <SortableChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  isExpanded={expandedChapters.has(chapter.id)}
                  selectedLessonId={selectedLessonId}
                  onToggle={() => onToggleChapter(chapter.id)}
                  onEditLesson={onEditLesson}
                  onAiRewriteLesson={onAiRewriteLesson}
                  onOpenViewer={onOpenViewer}
                  onRename={onRenameChapter}
                  onDelete={handleDeleteChapter}
                  onAddLesson={onAddLesson}
                  onDeleteLesson={onDeleteLesson}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete chapter?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteConfirm?.title}&quot;? All lessons
              in this chapter will be removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
