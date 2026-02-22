import { useState } from 'react'
import { FileDown, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export function ExportPage() {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'markdown' | 'csv'>('pdf')

  return (
    <div className="space-y-8 animate-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Export & import</h1>
        <p className="text-muted-foreground mt-1">Export curricula and notes, or import outlines</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Export
          </CardTitle>
          <CardDescription>
            Export your curricula to PDF, Markdown, or CSV with citations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Format</Label>
            <div className="flex gap-4 mt-2">
              {(['pdf', 'markdown', 'csv'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setExportFormat(f)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    exportFormat === f ? 'border-accent bg-accent/10 text-accent' : 'hover:bg-accent/5'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <Button>Export selected curriculum</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import
          </CardTitle>
          <CardDescription>
            Import Markdown or OPML outlines to create curricula
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop a file, or click to browse
            </p>
            <Button variant="secondary">Select file</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
