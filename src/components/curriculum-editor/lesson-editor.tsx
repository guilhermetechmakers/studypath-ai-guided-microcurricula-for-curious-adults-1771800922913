import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Details,
  DetailsSummary,
  DetailsContent,
} from '@tiptap/extension-details'
import {
  Sparkles,
  RefreshCw,
  MessageCircle,
  Save,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/types/curriculum'

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Placeholder.configure({
    placeholder: 'Write your lesson content here...',
  }),
  Details.configure({ persist: true }),
  DetailsSummary,
  DetailsContent,
]

interface LessonEditorProps {
  lesson: Lesson | null
  isSaving?: boolean
  hasUnsavedChanges?: boolean
  onSave: (updates: Partial<Lesson>) => void
  onAskAi?: () => void
  onRewrite?: (type: 'simpler' | 'more_technical' | 'concise') => void
  onGenerateExamples?: () => void
  className?: string
}

function AiActionBar({
  onAskAi,
  onRewrite,
  onGenerateExamples,
}: {
  onAskAi?: () => void
  onRewrite?: (type: 'simpler' | 'more_technical' | 'concise') => void
  onGenerateExamples?: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-muted/20 rounded-t-lg">
      {onAskAi && (
        <Button variant="secondary" size="sm" onClick={onAskAi}>
          <MessageCircle className="h-4 w-4" />
          <span className="ml-2">Ask AI</span>
        </Button>
      )}
      {onRewrite && (
        <>
          <Button variant="ghost" size="sm" onClick={() => onRewrite('simpler')}>
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Simpler</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onRewrite('more_technical')}>
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Technical</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onRewrite('concise')}>
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Concise</span>
          </Button>
        </>
      )}
      {onGenerateExamples && (
        <Button variant="ghost" size="sm" onClick={onGenerateExamples}>
          <Sparkles className="h-4 w-4" />
          <span className="ml-2">Alternate examples</span>
        </Button>
      )}
    </div>
  )
}

export function LessonEditor({
  lesson,
  isSaving = false,
  hasUnsavedChanges = false,
  onSave,
  onAskAi,
  onRewrite,
  onGenerateExamples,
  className,
}: LessonEditorProps) {
  const [title, setTitle] = React.useState(lesson?.title ?? '')
  const [summary, setSummary] = React.useState(lesson?.summary ?? '')
  const [estimatedMinutes, setEstimatedMinutes] = React.useState(
    String(lesson?.estimatedMinutes ?? 15)
  )

  React.useEffect(() => {
    if (lesson) {
      setTitle(lesson.title)
      setSummary(lesson.summary ?? '')
      setEstimatedMinutes(String(lesson.estimatedMinutes ?? 15))
    }
  }, [lesson?.id, lesson?.title, lesson?.summary, lesson?.estimatedMinutes])

  const editor = useEditor({
    extensions,
    content: lesson?.body ?? lesson?.content ?? '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none prose-headings:font-semibold prose-p:mb-4',
      },
    },
  }, [lesson?.id])

  React.useEffect(() => {
    if (editor && lesson) {
      const content = lesson.body ?? lesson.content ?? ''
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content)
      }
    }
  }, [lesson?.id, editor])

  const debouncedSave = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(() => {
    if (!lesson || !editor) return
    const handleUpdate = () => {
      if (debouncedSave.current) clearTimeout(debouncedSave.current)
      debouncedSave.current = setTimeout(() => {
        onSave({
          title,
          summary,
          estimatedMinutes: parseInt(estimatedMinutes, 10) || 15,
          body: editor.getHTML(),
        })
      }, 1500)
    }
    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
      if (debouncedSave.current) clearTimeout(debouncedSave.current)
    }
  }, [editor, lesson?.id, title, summary, estimatedMinutes, onSave])

  const handleExplicitSave = () => {
    if (editor) {
      onSave({
        title,
        summary,
        estimatedMinutes: parseInt(estimatedMinutes, 10) || 15,
        body: editor.getHTML(),
      })
    }
  }

  if (!lesson) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center min-h-[300px] rounded-xl border border-dashed border-muted-foreground/30 bg-muted/5 text-muted-foreground',
          className
        )}
      >
        <p className="text-sm">Select a lesson to edit</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card overflow-hidden shadow-card transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 p-4 border-b bg-muted/5">
        <div className="flex-1 space-y-2 min-w-0">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && onSave({ title: title.trim() })}
            className="text-lg font-semibold"
            placeholder="Lesson title"
          />
          <Input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            onBlur={() => onSave({ summary })}
            className="text-sm text-muted-foreground"
            placeholder="Short summary"
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Est. time:</span>
              <Input
                type="number"
                min={1}
                max={999}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                onBlur={() =>
                  onSave({
                    estimatedMinutes: parseInt(estimatedMinutes, 10) || 15,
                  })
                }
                className="w-16 h-8"
              />
              <span className="text-muted-foreground">min</span>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span className="text-xs text-muted-foreground animate-pulse">Unsaved</span>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={handleExplicitSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span className="ml-2">Save</span>
          </Button>
        </div>
      </div>

      <AiActionBar
        onAskAi={onAskAi}
        onRewrite={onRewrite}
        onGenerateExamples={onGenerateExamples}
      />

      <div className="prose-wrapper">
        <EditorContent editor={editor} />
      </div>

      <style>{`
        .prose-wrapper .ProseMirror {
          min-height: 200px;
          padding: 1rem;
        }
        .prose-wrapper .ProseMirror p.is-editor-empty:first-child::before {
          color: rgb(107 114 128);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
