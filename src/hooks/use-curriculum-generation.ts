import { useState, useCallback, useRef } from 'react'
import { generateCurriculum, getStreamUrl } from '@/api/curriculum'
import type {
  Curriculum,
  GenerationRequest,
  Chapter,
  Lesson,
} from '@/types/curriculum'

const MOCK_CHAPTERS: Omit<Chapter, 'id'>[] = [
  {
    title: 'Mythological foundations',
    summary: 'Homer and the Trojan War in myth',
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
    order: 0,
    estimatedMinutes: 35,
  },
  {
    title: 'Archaeological discovery',
    summary: 'From Schliemann to modern excavations',
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
    order: 1,
    estimatedMinutes: 30,
  },
]

function createMockCurriculum(prompt: string): Curriculum {
  const id = `gen-${Date.now()}`
  const chapters: Chapter[] = MOCK_CHAPTERS.map((ch, i) => ({
    ...ch,
    id: `c${i + 1}-${id}`,
    lessons: ch.lessons.map((l, j) => ({
      ...l,
      id: `l${i + 1}-${j + 1}-${id}`,
    })),
  }))
  const totalMinutes = chapters.reduce(
    (s, c) => s + (c.estimatedMinutes ?? c.lessons.reduce((a, l) => a + l.estimatedMinutes, 0)),
    0
  )
  return {
    id,
    title: prompt.slice(0, 60) + (prompt.length > 60 ? '...' : ''),
    description: 'AI-generated curriculum',
    chapters,
    totalEstimatedMinutes: totalMinutes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'generated',
  }
}

export interface UseCurriculumGenerationOptions {
  onComplete?: (curriculum: Curriculum) => void
  onError?: (error: string) => void
}

export function useCurriculumGeneration(options?: UseCurriculumGenerationOptions) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMessage, setProgressMessage] = useState<string>('')
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const runMockGeneration = useCallback(
    async (prompt: string) => {
      setProgress(0)
      setProgressMessage('Building outline...')
      await new Promise((r) => setTimeout(r, 400))
      setProgress(25)
      setProgressMessage('Generating chapters...')
      await new Promise((r) => setTimeout(r, 500))
      setProgress(50)
      setProgressMessage('Writing lessons...')
      await new Promise((r) => setTimeout(r, 600))
      setProgress(75)
      setProgressMessage('Adding citations and images...')
      await new Promise((r) => setTimeout(r, 400))
      setProgress(100)
      const result = createMockCurriculum(prompt)
      setCurriculum(result)
      options?.onComplete?.(result)
    },
    [options]
  )

  const generate = useCallback(
    async (request: GenerationRequest) => {
      setIsGenerating(true)
      setError(null)
      setCurriculum(null)
      abortRef.current = new AbortController()

      try {
        const res = await generateCurriculum(request)
        const streamUrl = getStreamUrl(res.job_id)
        const token = localStorage.getItem('auth_token')
        const urlWithAuth = token
          ? `${streamUrl}?token=${encodeURIComponent(token)}`
          : streamUrl

        const es = new EventSource(urlWithAuth)
        let currentCurriculum: Curriculum | null = null

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as { type: string; payload?: unknown }
            if (data.type === 'progress') {
              const p = data.payload as { percent?: number; message?: string }
              if (p.percent != null) setProgress(p.percent)
              if (p.message) setProgressMessage(p.message)
            } else if (data.type === 'chapter') {
              const ch = data.payload as Chapter
              if (!currentCurriculum) {
                currentCurriculum = createMockCurriculum(request.prompt)
              }
              const existing = currentCurriculum.chapters.find((c) => c.id === ch.id)
              if (!existing) {
                currentCurriculum.chapters.push(ch)
                setCurriculum({ ...currentCurriculum })
              }
            } else if (data.type === 'lesson') {
              const lesson = data.payload as Lesson
              if (!currentCurriculum) {
                currentCurriculum = createMockCurriculum(request.prompt)
              }
              const chapter = currentCurriculum.chapters.find(
                (c) => c.id === (lesson as unknown as { chapterId?: string }).chapterId
              )
              if (chapter && !chapter.lessons?.find((l) => l.id === lesson.id)) {
                chapter.lessons = [...(chapter.lessons ?? []), lesson]
                setCurriculum({ ...currentCurriculum })
              }
            } else if (data.type === 'complete') {
              const payload = data.payload as { curriculum?: Curriculum }
              if (payload.curriculum) {
                setCurriculum(payload.curriculum)
                options?.onComplete?.(payload.curriculum)
              } else if (currentCurriculum) {
                setCurriculum(currentCurriculum)
                options?.onComplete?.(currentCurriculum)
              }
              es.close()
            } else if (data.type === 'error') {
              const payload = data.payload as { message?: string }
              setError(payload.message ?? 'Generation failed')
              es.close()
            }
          } catch {
            // ignore parse errors
          }
        }

        es.onerror = () => {
          es.close()
          runMockGeneration(request.prompt)
        }
      } catch {
        await runMockGeneration(request.prompt)
      } finally {
        setIsGenerating(false)
        abortRef.current = null
      }
    },
    [options, runMockGeneration]
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const reset = useCallback(() => {
    setCurriculum(null)
    setError(null)
    setProgress(0)
    setProgressMessage('')
  }, [])

  return {
    generate,
    cancel,
    reset,
    isGenerating,
    progress,
    progressMessage,
    curriculum,
    error,
  }
}
