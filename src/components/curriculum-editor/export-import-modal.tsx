import * as React from 'react'
import { Download, Upload, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

export type ExportFormat = 'pdf' | 'markdown' | 'csv' | 'zip'

interface ExportImportModalProps {
  mode: 'export' | 'import'
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport?: (options: {
    format: ExportFormat
    includeNotes: boolean
    includeProgress: boolean
  }) => void
  onImport?: (file: File, options: { mergeOption: 'replace' | 'append' | 'create_new' }) => void
  isExporting?: boolean
  isImporting?: boolean
  importPreview?: { title: string; chapterCount: number; lessonCount: number } | null
  onConfirmImport?: () => void
}

export function ExportImportModal({
  mode,
  open,
  onOpenChange,
  onExport,
  onImport,
  isExporting = false,
  isImporting = false,
  importPreview,
  onConfirmImport,
}: ExportImportModalProps) {
  const [format, setFormat] = React.useState<ExportFormat>('markdown')
  const [includeNotes, setIncludeNotes] = React.useState(false)
  const [includeProgress, setIncludeProgress] = React.useState(false)
  const [mergeOption, setMergeOption] = React.useState<'replace' | 'append' | 'create_new'>('create_new')
  const [file, setFile] = React.useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!open) {
      setFile(null)
      setFormat('markdown')
      setIncludeNotes(false)
      setIncludeProgress(false)
      setMergeOption('create_new')
    }
  }, [open])

  const handleExport = () => {
    onExport?.({ format, includeNotes, includeProgress })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleImport = () => {
    if (file) onImport?.(file, { mergeOption })
  }

  const formats: { value: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { value: 'pdf', label: 'PDF', icon: <FileText className="h-4 w-4" /> },
    { value: 'markdown', label: 'Markdown', icon: <FileText className="h-4 w-4" /> },
    { value: 'csv', label: 'CSV', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { value: 'zip', label: 'ZIP (Markdown + images)', icon: <Download className="h-4 w-4" /> },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'export' ? 'Export curriculum' : 'Import curriculum'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'export'
              ? 'Choose a format and options for your export.'
              : 'Upload an OPML or Markdown file to import.'}
          </DialogDescription>
        </DialogHeader>

        {mode === 'export' && (
          <div className="space-y-6">
            <div>
              <Label className="mb-2 block">Format</Label>
              <div className="grid grid-cols-2 gap-2">
                {formats.map((f) => (
                  <Button
                    key={f.value}
                    variant={format === f.value ? 'default' : 'secondary'}
                    size="sm"
                    className="justify-start"
                    onClick={() => setFormat(f.value)}
                  >
                    {f.icon}
                    <span className="ml-2">{f.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include-notes"
                  checked={includeNotes}
                  onCheckedChange={(c) => setIncludeNotes(!!c)}
                />
                <Label htmlFor="include-notes">Include notes</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="include-progress"
                  checked={includeProgress}
                  onCheckedChange={(c) => setIncludeProgress(!!c)}
                />
                <Label htmlFor="include-progress">Include progress</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="bg-gradient-to-r from-accent to-accent/80"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="ml-2">Export</span>
              </Button>
            </DialogFooter>
          </div>
        )}

        {mode === 'import' && (
          <div className="space-y-6">
            <div>
              <Label className="mb-2 block">File (OPML or Markdown)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".opml,.xml,.md,.markdown"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                <span className="ml-2">{file ? file.name : 'Choose file'}</span>
              </Button>
            </div>
            {file && (
              <div>
                <Label className="mb-2 block">Import as</Label>
                <div className="space-y-2">
                  {(['create_new', 'append', 'replace'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setMergeOption(opt)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-colors',
                        mergeOption === opt
                          ? 'border-accent bg-accent/10'
                          : 'hover:bg-accent/5'
                      )}
                    >
                      {opt === 'create_new' && 'Create new curriculum'}
                      {opt === 'append' && 'Append to current'}
                      {opt === 'replace' && 'Replace current'}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {importPreview && (
              <div className="rounded-lg border p-4 bg-muted/20">
                <p className="font-medium">{importPreview.title}</p>
                <p className="text-sm text-muted-foreground">
                  {importPreview.chapterCount} chapters · {importPreview.lessonCount} lessons
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={importPreview ? onConfirmImport : handleImport}
                disabled={!file || isImporting}
                className="bg-gradient-to-r from-accent to-accent/80"
              >
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span className="ml-2">
                  {importPreview ? 'Confirm import' : 'Import'}
                </span>
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
