import * as React from 'react'
import {
  Share2,
  Download,
  Copy,
  History,
  Send,
  MoreHorizontal,
  Check,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Curriculum } from '@/types/curriculum'

interface CurriculumHeaderProps {
  curriculum: Curriculum
  isSaving?: boolean
  hasUnsavedChanges?: boolean
  onTitleChange: (title: string) => void
  onDescriptionChange?: (description: string) => void
  onSave: () => void
  onPublish?: () => void
  onExport: () => void
  onDuplicate: () => void
  onShare: () => void
  onVersionHistory: () => void
  className?: string
}

export function CurriculumHeader({
  curriculum,
  isSaving = false,
  hasUnsavedChanges = false,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onPublish,
  onExport,
  onDuplicate,
  onShare,
  onVersionHistory,
  className,
}: CurriculumHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = React.useState(false)
  const [titleValue, setTitleValue] = React.useState(curriculum.title)
  const [isEditingDesc, setIsEditingDesc] = React.useState(false)
  const [descValue, setDescValue] = React.useState(curriculum.description ?? '')

  React.useEffect(() => {
    setTitleValue(curriculum.title)
    setDescValue(curriculum.description ?? '')
  }, [curriculum.title, curriculum.description])

  const handleTitleBlur = () => {
    setIsEditingTitle(false)
    if (titleValue.trim() && titleValue !== curriculum.title) {
      onTitleChange(titleValue.trim())
    } else {
      setTitleValue(curriculum.title)
    }
  }

  const handleDescBlur = () => {
    setIsEditingDesc(false)
    if (descValue !== (curriculum.description ?? '')) {
      onDescriptionChange?.(descValue)
    } else {
      setDescValue(curriculum.description ?? '')
    }
  }

  const totalMins = curriculum.chapters?.reduce(
    (s, ch) => s + (ch.lessons ?? []).reduce((a, l) => a + (l.estimatedMinutes ?? 15), 0),
    0
  ) ?? curriculum.totalEstimatedMinutes ?? 0

  return (
    <header
      className={cn(
        'space-y-4 rounded-xl border border-border bg-card p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          {isEditingTitle ? (
            <Input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
              className="text-2xl font-semibold h-12"
              autoFocus
              aria-label="Curriculum title"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl font-semibold text-left hover:bg-accent/5 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors w-full"
            >
              {curriculum.title}
            </button>
          )}
          {isEditingDesc ? (
            <Input
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={handleDescBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleDescBlur()}
              placeholder="Short description..."
              className="text-muted-foreground"
              autoFocus
              aria-label="Curriculum description"
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingDesc(true)}
              className={cn(
                'text-sm text-muted-foreground text-left hover:bg-accent/5 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors w-full',
                !curriculum.description && 'italic'
              )}
            >
              {curriculum.description || 'Add a short description...'}
            </button>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              {curriculum.chapters?.length ?? 0} chapters · {totalMins} min total
            </span>
            {curriculum.createdAt && (
              <span>
                Created {new Date(curriculum.createdAt).toLocaleDateString()}
              </span>
            )}
            {curriculum.updatedAt && (
              <span>
                Last edited {new Date(curriculum.updatedAt).toLocaleDateString()}
              </span>
            )}
            {curriculum.tags && curriculum.tags.length > 0 && (
              <div className="flex gap-1">
                {curriculum.tags.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="rounded px-1.5 py-0.5 bg-muted/50 text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground animate-pulse">Unsaved</span>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={onSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            <span className="ml-2">Save</span>
          </Button>
          {onPublish && (
            <Button variant="secondary" size="sm" onClick={onPublish}>
              <Send className="h-4 w-4" />
              <span className="ml-2">Publish</span>
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onExport}>
            <Download className="h-4 w-4" />
            <span className="ml-2">Export</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
            <span className="ml-2">Duplicate</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={onShare}>
            <Share2 className="h-4 w-4" />
            <span className="ml-2">Share</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onVersionHistory}>
                <History className="h-4 w-4 mr-2" />
                Version history
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
