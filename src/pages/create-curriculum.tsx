import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sparkles } from 'lucide-react'
import { CreateCurriculumProvider, useCreateCurriculum } from '@/contexts/create-curriculum-context'
import {
  PromptInput,
  SettingsPanel,
  GenerateModal,
  CurriculumPreviewTree,
  LessonPreviewPane,
  SaveAdoptBar,
  SchedulerMini,
} from '@/components/create-curriculum'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  generateCurriculum,
  getStreamUrl,
  saveCurriculum,
  adoptCurriculum,
} from '@/api/curriculum'
import type { Curriculum, Chapter, Lesson } from '@/types/curriculum'

const promptSchema = z.object({
  prompt: z.string().min(15, 'Enter at least 15 characters').max(2000),
})

type PromptFormData = z.infer<typeof promptSchema>

function useGenerationStream(jobId: string | null, onChapter: (ch: Chapter) => void, onLesson: (l: Lesson) => void, onComplete: (c: Curriculum) => void, onError: (e: string) => void) {
  const [progress, setProgress] = React.useState(0)
  const [cancelled, setCancelled] = React.useState(false)

  React.useEffect(() => {
    if (!jobId || cancelled) return

    const url = getStreamUrl(jobId)
    const token = localStorage.getItem('auth_token')
    const headers: HeadersInit = {}
    if (token) headers['Authorization'] = `Bearer ${token}`

    const ac = new AbortController()
    fetch(url, { signal: ac.signal, headers })
      .then(async (res) => {
        if (!res.ok) throw new Error(res.statusText)
        const reader = res.body?.getReader()
        if (!reader) return
        const decoder = new TextDecoder()
        let buffer = ''
        let curriculum: Curriculum = {
          id: '',
          title: '',
          chapters: [],
          totalEstimatedMinutes: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        const chapters = new Map<string, Chapter>()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'chapter' && data.payload) {
                  const ch = data.payload as Chapter
                  chapters.set(ch.id, { ...ch, lessons: ch.lessons ?? [] })
                  onChapter(ch)
                } else if (data.type === 'lesson' && data.payload) {
                  const l = data.payload as Lesson
                  onLesson(l)
                } else if (data.type === 'complete' && data.payload) {
                  curriculum = data.payload
                  onComplete(curriculum)
                } else if (data.type === 'error') {
                  onError(data.payload?.message ?? 'Generation failed')
                }
              } catch {
                // skip invalid JSON
              }
            }
          }
          setProgress((p) => Math.min(p + 5, 95))
        }
        setProgress(100)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') onError(err.message ?? 'Stream failed')
      })

    return () => {
      setCancelled(true)
      ac.abort()
    }
  }, [jobId, cancelled, onChapter, onLesson, onComplete, onError])

  return { progress, cancel: () => setCancelled(true) }
}

function CreateCurriculumContent() {
  const navigate = useNavigate()
  const {
    state,
    setPrompt,
    setParams,
    addContextChip,
    removeContextChip,
    dispatch,
  } = useCreateCurriculum()

  const [expandedChapters, setExpandedChapters] = React.useState<Set<string>>(new Set())
  const [showGenerateModal, setShowGenerateModal] = React.useState(false)
  const [previewLesson, setPreviewLesson] = React.useState<Lesson | null>(null)
  const [showScheduler, setShowScheduler] = React.useState(false)
  const [schedulerLesson, setSchedulerLesson] = React.useState<Lesson | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isAdopting, setIsAdopting] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(true)

  const { handleSubmit, formState: { errors }, setValue, watch } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: { prompt: state.prompt },
  })
  const promptValue = watch('prompt')

  React.useEffect(() => {
    setPrompt(promptValue ?? '')
  }, [promptValue, setPrompt])

  const onChapter = React.useCallback((ch: Chapter) => {
    dispatch({ type: 'GENERATION_PROGRESS', payload: `Chapter: ${ch.title}` })
    setExpandedChapters((prev) => new Set([...prev, ch.id]))
  }, [dispatch])

  const onLesson = React.useCallback((l: Lesson) => {
    dispatch({ type: 'GENERATION_PROGRESS', payload: `Lesson: ${l.title}` })
  }, [dispatch])

  const onComplete = React.useCallback((curriculum: Curriculum) => {
    dispatch({ type: 'GENERATION_SUCCESS', payload: curriculum })
  }, [dispatch])

  const onStreamError = React.useCallback((msg: string) => {
    dispatch({ type: 'GENERATION_FAILED', payload: msg })
  }, [dispatch])

  const { progress, cancel } = useGenerationStream(
    state.jobId,
    onChapter,
    onLesson,
    onComplete,
    onStreamError
  )

  const runMockGeneration = React.useCallback(async (prompt: string) => {
    dispatch({ type: 'GENERATION_PROGRESS', payload: 'Building outline...' })
    await new Promise((r) => setTimeout(r, 400))
    dispatch({ type: 'GENERATION_PROGRESS', payload: 'Generating chapters...' })
    await new Promise((r) => setTimeout(r, 500))
    dispatch({ type: 'GENERATION_PROGRESS', payload: 'Writing lessons...' })
    await new Promise((r) => setTimeout(r, 600))
    dispatch({ type: 'GENERATION_PROGRESS', payload: 'Adding citations and images...' })
    await new Promise((r) => setTimeout(r, 400))
    const mockCurriculum: Curriculum = {
      id: `gen-${Date.now()}`,
      title: prompt.slice(0, 60) + (prompt.length > 60 ? '...' : ''),
      description: 'AI-generated curriculum (demo)',
      chapters: [
        {
          id: 'c1',
          title: 'Mythological foundations',
          summary: 'Homer and the Trojan War in myth',
          order: 0,
          lessons: [
            {
              id: 'l1',
              title: 'Homer and the Iliad',
              content: 'The Iliad is one of the oldest works of Western literature...',
              estimatedMinutes: 15,
              tags: ['literature', 'mythology'],
            },
            {
              id: 'l2',
              title: 'The Trojan War in myth',
              content: 'The Trojan War has been a central theme in Greek mythology...',
              estimatedMinutes: 20,
              tags: ['mythology'],
            },
          ],
        },
        {
          id: 'c2',
          title: 'Archaeological discovery',
          summary: 'From Schliemann to modern excavations',
          order: 1,
          lessons: [
            {
              id: 'l3',
              title: 'Heinrich Schliemann',
              content: 'Heinrich Schliemann was a German businessman and pioneer of archaeology...',
              estimatedMinutes: 18,
              tags: ['archaeology', 'history'],
            },
            {
              id: 'l4',
              title: 'Troy today',
              content: 'The site of Troy is located in modern-day Turkey...',
              estimatedMinutes: 12,
              tags: ['archaeology'],
            },
          ],
        },
      ],
      totalEstimatedMinutes: 65,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'generated',
    }
    dispatch({ type: 'GENERATION_SUCCESS', payload: mockCurriculum })
    setExpandedChapters(new Set(['c1', 'c2']))
    toast.success('Curriculum generated! (demo mode)')
  }, [dispatch])

  const onSubmit = async (data: PromptFormData) => {
    setShowGenerateModal(true)
    dispatch({ type: 'GENERATION_PROGRESS', payload: 'Starting generation...' })
    try {
      const res = await generateCurriculum({
        prompt: data.prompt,
        params: {
          session_length_minutes: state.params.session_length_minutes,
          duration_weeks: state.params.duration_weeks,
          depth: state.params.depth,
          focus_tags: state.params.focus_tags,
          prior_knowledge: state.params.prior_knowledge,
          advanced_options: state.params.advanced_options,
        },
        context: {
          recent_notes: state.contextChips.map((c) => c.label).join(', '),
        },
      })
      const jobId = res.job_id ?? (res as { jobId?: string }).jobId ?? ''
      if (jobId) {
        dispatch({ type: 'START_GENERATION', payload: { jobId } })
      } else {
        await runMockGeneration(data.prompt)
      }
    } catch {
      await runMockGeneration(data.prompt)
    }
  }

  const estimatedLessons = state.curriculum
    ? state.curriculum.chapters.reduce((s, ch) => s + (ch.lessons?.length ?? 0), 0)
    : 0
  const estimatedHours = state.curriculum
    ? Math.round((state.curriculum.totalEstimatedMinutes ?? 0) / 60)
    : 0

  const handleSave = async () => {
    if (!state.curriculum) return
    setIsSaving(true)
    try {
      const saved = await saveCurriculum(state.curriculum)
      dispatch({ type: 'SET_CURRICULUM', payload: saved })
      toast.success('Saved to My Curricula')
      navigate(`/dashboard/curricula/${saved.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAdopt = async () => {
    if (!state.curriculum?.id) return
    setIsAdopting(true)
    try {
      const res = await adoptCurriculum(state.curriculum.id)
      const entries = res.scheduleEntries ?? []
      toast.success(`Scheduled ${entries.length} sessions`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Adopt failed')
    } finally {
      setIsAdopting(false)
    }
  }

  const handleExport = (format: 'json' | 'markdown' | 'opml') => {
    if (!state.curriculum) return
    const blob =
      format === 'json'
        ? new Blob([JSON.stringify(state.curriculum, null, 2)], { type: 'application/json' })
        : format === 'markdown'
          ? new Blob([exportAsMarkdown(state.curriculum)], { type: 'text/markdown' })
          : new Blob([exportAsOpml(state.curriculum)], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `curriculum-${state.curriculum.title.replace(/\s+/g, '-')}.${format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'opml'}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Exported as ${format.toUpperCase()}`)
  }

  const handleShare = () => {
    if (!state.curriculum?.id) return
    const url = `${window.location.origin}/dashboard/curricula/${state.curriculum.id}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied to clipboard'))
  }

  const handleScheduleLesson = (lesson: Lesson) => {
    setSchedulerLesson(lesson)
    setShowScheduler(true)
  }

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-semibold">Create curriculum</h1>
        <p className="text-muted-foreground mt-1">
          Turn your curiosity into a structured study plan
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What do you want to learn?</CardTitle>
              <CardDescription>
                Enter a prompt. We&apos;ll generate chapters, lessons, and time estimates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <PromptInput
                  value={state.prompt}
                  onChange={(v) => setValue('prompt', v)}
                  contextChips={state.contextChips}
                  onAddContextChip={addContextChip}
                  onRemoveContextChip={removeContextChip}
                  error={errors.prompt?.message}
                />
                <div className="flex flex-wrap gap-4">
                  <Button
                    type="submit"
                    disabled={state.jobStatus === 'running'}
                    className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {state.jobStatus === 'running' ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {state.curriculum && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>{state.curriculum.title}</CardDescription>
                </div>
                <SaveAdoptBar
                  curriculumId={state.curriculum.id}
                  onSave={handleSave}
                  onAdopt={handleAdopt}
                  onExport={handleExport}
                  onShare={handleShare}
                  isSaving={isSaving}
                  isAdopting={isAdopting}
                />
              </CardHeader>
              <CardContent>
                <CurriculumPreviewTree
                  curriculum={state.curriculum}
                  expandedChapters={expandedChapters}
                  onToggleChapter={(id) =>
                    setExpandedChapters((prev) => {
                      const next = new Set(prev)
                      if (next.has(id)) next.delete(id)
                      else next.add(id)
                      return next
                    })
                  }
                  onPreviewLesson={setPreviewLesson}
                  onScheduleLesson={handleScheduleLesson}
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <button
                type="button"
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="flex w-full items-center justify-between text-left"
              >
                <CardTitle className="text-base">Settings</CardTitle>
                <span className="text-muted-foreground">{settingsOpen ? '−' : '+'}</span>
              </button>
            </CardHeader>
            {settingsOpen && (
              <CardContent>
                <SettingsPanel
                  params={state.params}
                  onChange={setParams}
                  estimatedLessons={estimatedLessons}
                  estimatedHours={estimatedHours}
                />
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      <GenerateModal
        open={showGenerateModal}
        onOpenChange={setShowGenerateModal}
        status={state.jobStatus}
        progressMessages={state.progressMessages}
        progressPercent={progress}
        onCancel={cancel}
        error={state.error}
      >
        {state.curriculum && (
          <CurriculumPreviewTree
            curriculum={state.curriculum}
            expandedChapters={expandedChapters}
            onToggleChapter={(id) =>
              setExpandedChapters((prev) => {
                const next = new Set(prev)
                if (next.has(id)) next.delete(id)
                else next.add(id)
                return next
              })
            }
          />
        )}
      </GenerateModal>

      <LessonPreviewPane
        lesson={previewLesson}
        open={!!previewLesson}
        onOpenChange={(open) => {
          if (!open) setPreviewLesson(null)
        }}
        onOpenInViewer={(lesson: Lesson) => {
          if (state.curriculum?.id) {
            navigate(`/dashboard/curricula/${state.curriculum.id}/lesson/${lesson.id}`)
          }
        }}
      />

      <SchedulerMini
        open={showScheduler}
        onOpenChange={setShowScheduler}
        lesson={schedulerLesson}
        onConfirm={() => {
          setSchedulerLesson(null)
          toast.success('Lessons scheduled')
        }}
      />
    </div>
  )
}

function exportAsMarkdown(c: Curriculum): string {
  let md = `# ${c.title}\n\n`
  if (c.description) md += `${c.description}\n\n`
  for (const ch of c.chapters ?? []) {
    md += `## ${ch.title}\n\n`
    for (const l of ch.lessons ?? []) {
      md += `### ${l.title} (${l.estimatedMinutes ?? 15} min)\n\n`
      md += `${l.body ?? l.content ?? ''}\n\n`
    }
  }
  return md
}

function exportAsOpml(c: Curriculum): string {
  let opml = '<?xml version="1.0" encoding="UTF-8"?>\n<opml version="2.0">\n<head><title>' + (c.title ?? '') + '</title></head>\n<body>\n'
  for (const ch of c.chapters ?? []) {
    opml += `<outline text="${escapeXml(ch.title)}">\n`
    for (const l of ch.lessons ?? []) {
      opml += `  <outline text="${escapeXml(l.title)}" _duration="${l.estimatedMinutes ?? 15}"/>\n`
    }
    opml += '</outline>\n'
  }
  opml += '</body>\n</opml>'
  return opml
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function CreateCurriculumPage() {
  return (
    <CreateCurriculumProvider>
      <CreateCurriculumContent />
    </CreateCurriculumProvider>
  )
}
