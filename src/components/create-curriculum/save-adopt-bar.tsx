import { Save, BookOpen, Download, Share2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface SaveAdoptBarProps {
  curriculumId: string | null
  onSave: () => void
  onAdopt: () => void
  onExport: (format: 'json' | 'markdown' | 'opml') => void
  onShare: () => void
  isSaving?: boolean
  isAdopting?: boolean
  disabled?: boolean
  className?: string
}

export function SaveAdoptBar({
  curriculumId,
  onSave,
  onAdopt,
  onExport,
  onShare,
  isSaving = false,
  isAdopting = false,
  disabled = false,
  className,
}: SaveAdoptBarProps) {
  const hasCurriculum = !!curriculumId

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Button
        onClick={onSave}
        disabled={disabled || !hasCurriculum || isSaving}
        variant="secondary"
        size="sm"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save to My Curricula
      </Button>
      <Button
        onClick={onAdopt}
        disabled={disabled || !hasCurriculum || isAdopting}
        size="sm"
      >
        {isAdopting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <BookOpen className="h-4 w-4 mr-2" />
        )}
        Adopt Now
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled || !hasCurriculum}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onExport('json')}>
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onExport('markdown')}>
            Export as Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onExport('opml')}>
            Export as OPML
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        variant="secondary"
        size="sm"
        onClick={onShare}
        disabled={disabled || !hasCurriculum}
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
    </div>
  )
}
