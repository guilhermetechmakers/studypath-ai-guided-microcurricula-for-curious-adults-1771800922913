import { History, RotateCcw, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { CurriculumVersion } from '@/types/curriculum'

interface VersionHistoryPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  versions: CurriculumVersion[]
  isLoading?: boolean
  onRevert: (versionId: string) => void
  isReverting?: boolean
  curriculumId: string
}

export function VersionHistoryPanel({
  open,
  onOpenChange,
  versions,
  isLoading = false,
  onRevert,
  isReverting = false,
}: VersionHistoryPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version history
          </DialogTitle>
          <DialogDescription>
            View and revert to previous versions of this curriculum.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : versions.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-sm">No version history yet.</p>
            <p className="text-xs mt-1">Versions are created when you save significant changes.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {versions.map((v) => (
              <li
                key={v.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-4 hover:bg-accent/5 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {v.change_summary || 'Update'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(v.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onRevert(v.id)}
                  disabled={isReverting}
                >
                  {isReverting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  <span className="ml-2">Revert</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
