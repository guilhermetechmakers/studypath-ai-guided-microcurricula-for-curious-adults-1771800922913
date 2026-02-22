import {
  GripVertical,
  Pencil,
  RefreshCw,
  Eye,
  Check,
  Image,
  FileText,
  MoreHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/types/curriculum'

interface LessonCardProps {
  lesson: Lesson
  isSelected?: boolean
  progressStatus?: 'not_started' | 'in_progress' | 'completed'
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  onEdit: () => void
  onAiRewrite?: (type: 'simpler' | 'more_technical' | 'concise') => void
  onOpenViewer: () => void
  onMarkComplete?: () => void
  onRemove?: () => void
  className?: string
}

export function LessonCard({
  lesson,
  isSelected = false,
  progressStatus = 'not_started',
  dragHandleProps,
  onEdit,
  onAiRewrite,
  onOpenViewer,
  onMarkComplete,
  onRemove,
  className,
}: LessonCardProps) {
  const hasDeepDive =
    (lesson.goDeep?.length ?? 0) > 0 ||
    (lesson.go_deep?.length ?? 0) > 0 ||
    !!lesson.goDeeper
  const hasMedia =
    (lesson.imageRequests?.length ?? 0) > 0 ||
    !!lesson.imageUrl ||
    (lesson.media?.length ?? 0) > 0
  const hasCitations = (lesson.citations?.length ?? 0) > 0

  const summary = lesson.summary ?? lesson.content?.slice(0, 120) ?? ''
  const displaySummary = summary.length > 100 ? `${summary.slice(0, 100)}...` : summary

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('button')) onEdit()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onEdit()
        }
      }}
      className={cn(
        'group flex items-start gap-2 rounded-lg border bg-card p-3 transition-all duration-200 cursor-pointer',
        'hover:shadow-card hover:border-accent/30',
        isSelected && 'ring-2 ring-accent border-accent/50 shadow-card',
        className
      )}
    >
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="mt-1 cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-accent/10 hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium text-sm truncate">{lesson.title}</h4>
          <div className="flex gap-1 shrink-0">
            {hasDeepDive && (
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs bg-accent/10 text-accent">
                Deep dive
              </span>
            )}
            {hasMedia && (
              <Image className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            )}
            {hasCitations && (
              <FileText className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
            )}
          </div>
        </div>
        {displaySummary && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {displaySummary}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">
            {lesson.estimatedMinutes ?? 15} min
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onEdit}
              aria-label={`Edit ${lesson.title}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            {onAiRewrite && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    aria-label="AI Rewrite options"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onSelect={() => onAiRewrite('simpler')}>
                    Rewrite (Simpler)
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onAiRewrite('more_technical')}>
                    Rewrite (More technical)
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onAiRewrite('concise')}>
                    Rewrite (Concise)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onOpenViewer}
              aria-label={`Open ${lesson.title} in viewer`}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            {onMarkComplete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onMarkComplete}
                aria-label="Mark complete"
              >
                <Check
                  className={cn(
                    'h-3.5 w-3.5',
                    progressStatus === 'completed' && 'text-secondary'
                  )}
                />
              </Button>
            )}
            {onRemove && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    aria-label="Lesson menu"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={onRemove}
                  >
                    Remove lesson
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
