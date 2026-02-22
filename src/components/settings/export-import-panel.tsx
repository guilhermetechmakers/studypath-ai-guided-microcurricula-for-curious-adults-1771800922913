import { useState, useCallback } from 'react'
import { FileDown, Upload, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useCreateExport, useCreateImport } from '@/hooks/use-settings'
import { cn } from '@/lib/utils'

const EXPORT_FORMATS = [
  { id: 'pdf' as const, label: 'PDF' },
  { id: 'markdown' as const, label: 'Markdown' },
  { id: 'csv' as const, label: 'CSV' },
]

export function ExportImportPanel() {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'markdown' | 'csv'>('pdf')
  const [emailWhenReady, setEmailWhenReady] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)

  const createExport = useCreateExport()
  const createImport = useCreateImport()

  const handleExport = () => {
    createExport.mutate({
      items: [{ type: 'curriculum', id: 'all' }],
      format: exportFormat,
      emailWhenReady,
    })
  }

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.name.match(/\.(opml|md|markdown)$/i)) {
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        return
      }
      setImportFile(file)
      createImport.mutate(file)
    },
    [createImport]
  )

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-semibold">Export & Import</h1>
        <p className="text-muted-foreground mt-1">
          Export curricula and notes, or import outlines
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Export
          </CardTitle>
          <CardDescription>
            Export your curricula to PDF, Markdown, or CSV
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Format</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {EXPORT_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setExportFormat(f.id)}
                  className={cn(
                    'px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200',
                    exportFormat === f.id
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'hover:bg-accent/5'
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="email-ready"
              checked={emailWhenReady}
              onCheckedChange={(v) => setEmailWhenReady(!!v)}
            />
            <Label htmlFor="email-ready" className="text-sm font-normal cursor-pointer">
              Email me when export is ready
            </Label>
          </div>
          <Button
            onClick={handleExport}
            disabled={createExport.isPending}
          >
            {createExport.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Starting...
              </>
            ) : (
              'Start export'
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import
          </CardTitle>
          <CardDescription>
            Import OPML or Markdown outlines to create curricula
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200',
              isDragging ? 'border-accent bg-accent/5' : 'border-border'
            )}
          >
            <input
              type="file"
              accept=".opml,.md,.markdown"
              className="sr-only"
              id="import-file"
              onChange={handleFileInput}
            />
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop a file, or{' '}
              <label htmlFor="import-file" className="text-accent cursor-pointer hover:underline">
                browse
              </label>
            </p>
            <p className="text-xs text-muted-foreground">
              Supports .opml, .md — max 10MB
            </p>
            {importFile && (
              <p className="mt-2 text-sm font-medium">
                Selected: {importFile.name}
              </p>
            )}
            {createImport.isPending && (
              <div className="mt-4 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
