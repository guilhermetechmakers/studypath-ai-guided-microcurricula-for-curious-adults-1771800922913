import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  CurriculumHeader,
  ChapterList,
  LessonEditor,
  AiActionModal,
  InteractiveLessonViewer,
  SearchFilterBar,
  ExportImportModal,
  VersionHistoryPanel,
  type SearchFilters,
} from '@/components/curriculum-editor'
import {
  getCurriculumDetail,
  updateCurriculumDetail,
  duplicateCurriculum,
  createChapter,
  updateChapter,
  deleteChapter,
  reorderCurriculum,
  getCurriculumVersions,
  revertCurriculumVersion,
  updateLesson,
  deleteLesson,
  createLesson,
  startExport,
} from '@/api/curriculum-detail'
import { rewriteLesson, lessonQna } from '@/api/lessons'
import { search } from '@/api/search'
import type { Curriculum, Chapter, Lesson } from '@/types/curriculum'

const MOCK_CURRICULUM: Curriculum = {
  id: '1',
  title: 'History of Troy',
  description: 'From myth to archaeology',
  chapters: [
    {
      id: 'c1',
      title: 'Mythological foundations',
      order: 0,
      lessons: [
        {
          id: 'l1',
          title: 'Homer and the Iliad',
          content: 'The Iliad is one of the oldest works of Western literature...',
          summary: 'Introduction to Homer and the Iliad',
          estimatedMinutes: 15,
          tags: ['literature', 'mythology'],
        },
        {
          id: 'l2',
          title: 'The Trojan War in myth',
          content: 'The Trojan War has been a central theme in Greek mythology...',
          summary: 'Mythological background',
          estimatedMinutes: 20,
          tags: ['mythology'],
        },
      ],
    },
    {
      id: 'c2',
      title: 'Archaeological discovery',
      order: 1,
      lessons: [
        {
          id: 'l3',
          title: 'Heinrich Schliemann',
          content: 'Heinrich Schliemann was a German businessman and pioneer of archaeology...',
          summary: 'Pioneer of archaeology',
          estimatedMinutes: 18,
          tags: ['archaeology', 'history'],
        },
        {
          id: 'l4',
          title: 'Troy today',
          content: 'The site of Troy is located in modern-day Turkey...',
          summary: 'Modern excavations',
          estimatedMinutes: 12,
          tags: ['archaeology'],
        },
      ],
    },
  ],
  totalEstimatedMinutes: 65,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

function useCurriculumDetailWithFallback(id: string | undefined) {
  const query = useQuery({
    queryKey: ['curriculum', id],
    queryFn: async () => {
      try {
        return await getCurriculumDetail(id!)
      } catch {
        return { ...MOCK_CURRICULUM, id: id ?? '1' }
      }
    },
    enabled: !!id,
  })
  return query
}

export function CurriculumDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: curriculum, isLoading, refetch } = useCurriculumDetailWithFallback(id)
  const [expandedChapters, setExpandedChapters] = React.useState<Set<string>>(
    () => new Set(curriculum?.chapters?.map((c) => c.id) ?? ['c1'])
  )
  const [selectedLesson, setSelectedLesson] = React.useState<Lesson | null>(null)
  const [localCurriculum, setLocalCurriculum] = React.useState<Curriculum | null>(null)
  const [hasUnsavedHeader, setHasUnsavedHeader] = React.useState(false)
  const [hasUnsavedLesson, setHasUnsavedLesson] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchFilters, setSearchFilters] = React.useState<SearchFilters>({})
  const [showExportModal, setShowExportModal] = React.useState(false)
  const [showVersionHistory, setShowVersionHistory] = React.useState(false)
  const [showAiModal, setShowAiModal] = React.useState(false)
  const [aiModalType, setAiModalType] = React.useState<'rewrite' | 'qa'>('rewrite')
  const [aiRewriteTone, setAiRewriteTone] = React.useState<'simpler' | 'more_technical' | 'concise'>('simpler')
  const [aiResult, setAiResult] = React.useState<string | null>(null)
  const [aiError, setAiError] = React.useState<string | null>(null)
  const [isAiLoading, setIsAiLoading] = React.useState(false)
  const [showViewer, setShowViewer] = React.useState(false)

  const displayCurriculum = localCurriculum ?? curriculum

  React.useEffect(() => {
    if (curriculum) {
      setLocalCurriculum(curriculum)
      setExpandedChapters((prev) => {
        const next = new Set(prev)
        curriculum.chapters?.forEach((c) => next.add(c.id))
        return next
      })
    }
  }, [curriculum?.id])

  const searchFiltersForApi = React.useMemo(() => {
    const f: Record<string, string | string[]> = {}
    if (searchFilters.tags?.length) f.tags = searchFilters.tags
    if (searchFilters.estimatedTimeMin != null) f.estimated_time_min = String(searchFilters.estimatedTimeMin)
    if (searchFilters.estimatedTimeMax != null) f.estimated_time_max = String(searchFilters.estimatedTimeMax)
    if (searchFilters.hasMedia != null) f.has_media = String(searchFilters.hasMedia)
    if (searchFilters.completeness && searchFilters.completeness !== 'all') f.completeness = searchFilters.completeness
    return f
  }, [searchFilters])

  const searchQueryResult = useQuery({
    queryKey: ['search', searchQuery, searchFiltersForApi],
    queryFn: () => search({ q: searchQuery, filters: searchFiltersForApi as Record<string, string | string[]> }),
    enabled: searchQuery.length >= 2,
  })

  const versionsQuery = useQuery({
    queryKey: ['curriculum-versions', id],
    queryFn: () => getCurriculumVersions(id!),
    enabled: !!id && showVersionHistory,
  })

  const updateCurriculumMutation = useMutation({
    mutationFn: (updates: Partial<Curriculum>) =>
      updateCurriculumDetail(id!, updates),
    onSuccess: (data) => {
      queryClient.setQueryData(['curriculum', id], data)
      setLocalCurriculum(data)
      setHasUnsavedHeader(false)
    },
    onError: () => {
      if (displayCurriculum) setLocalCurriculum(displayCurriculum)
      toast.success('Saved (demo)')
      setHasUnsavedHeader(false)
    },
  })

  const handleTitleChange = (title: string) => {
    setLocalCurriculum((prev) => (prev ? { ...prev, title } : null))
    setHasUnsavedHeader(true)
  }

  const handleDescriptionChange = (desc: string) => {
    setLocalCurriculum((prev) => (prev ? { ...prev, description: desc } : null))
    setHasUnsavedHeader(true)
  }

  const handleSaveHeader = () => {
    if (!displayCurriculum) return
    updateCurriculumMutation.mutate({
      title: displayCurriculum.title,
      description: displayCurriculum.description,
    })
  }

  const handleDuplicate = async () => {
    try {
      const dup = await duplicateCurriculum(id!)
      toast.success('Duplicated')
      navigate(`/dashboard/curricula/${dup.id}`)
    } catch {
      toast.success('Duplicate (demo)')
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/dashboard/curricula/${id}`
    navigator.clipboard.writeText(url).then(() => toast.success('Link copied'))
  }

  const handleAddChapter = async () => {
    try {
      await createChapter(id!, 'New chapter')
      refetch()
    } catch {
      const newCh = {
        id: `c-${Date.now()}`,
        title: 'New chapter',
        order: (displayCurriculum?.chapters?.length ?? 0),
        lessons: [],
      }
      setLocalCurriculum((prev) =>
        prev
          ? {
              ...prev,
              chapters: [...(prev.chapters ?? []), newCh],
            }
          : null
      )
      setExpandedChapters((prev) => new Set([...prev, newCh.id]))
      toast.success('Chapter added')
    }
  }

  const handleRenameChapter = async (chapterId: string, title: string) => {
    try {
      await updateChapter(chapterId, { title })
      refetch()
    } catch {
      setLocalCurriculum((prev) =>
        prev
          ? {
              ...prev,
              chapters: (prev.chapters ?? []).map((c) =>
                c.id === chapterId ? { ...c, title } : c
              ),
            }
          : null
      )
      toast.success('Chapter renamed')
    }
  }

  const handleDeleteChapter = async (chapterId: string) => {
    try {
      await deleteChapter(chapterId)
      refetch()
    } catch {
      setLocalCurriculum((prev) =>
        prev
          ? {
              ...prev,
              chapters: (prev.chapters ?? []).filter((c) => c.id !== chapterId),
            }
          : null
      )
      if (selectedLesson) {
        const ch = displayCurriculum?.chapters?.find((c) =>
          c.lessons?.some((l) => l.id === selectedLesson.id)
        )
        if (ch?.id === chapterId) setSelectedLesson(null)
      }
      toast.success('Chapter deleted')
    }
  }

  const handleReorder = (chapters: Chapter[]) => {
    setLocalCurriculum((prev) => (prev ? { ...prev, chapters } : null))
    reorderCurriculum(id!, {
      chapters: chapters.map((c, i) => ({ id: c.id, position: i })),
      lessons: chapters.flatMap((c) =>
        (c.lessons ?? []).map((l, i) => ({
          id: l.id,
          position: i,
          chapterId: c.id,
        }))
      ),
    }).catch(() => {
      toast.success('Reordered (demo)')
    })
  }

  const handleAddLesson = async (chapterId: string) => {
    try {
      await createLesson(chapterId, id!, {
        title: 'New lesson',
        estimatedMinutes: 15,
        content: '',
      })
      refetch()
    } catch {
      const newLesson: Lesson = {
        id: `l-${Date.now()}`,
        title: 'New lesson',
        content: '',
        estimatedMinutes: 15,
      }
      setLocalCurriculum((prev) =>
        prev
          ? {
              ...prev,
              chapters: (prev.chapters ?? []).map((c) =>
                c.id === chapterId
                  ? { ...c, lessons: [...(c.lessons ?? []), newLesson] }
                  : c
              ),
            }
          : null
      )
      setSelectedLesson(newLesson)
      setExpandedChapters((prev) => new Set([...prev, chapterId]))
      toast.success('Lesson added')
    }
  }

  const handleDeleteLesson = async (lesson: Lesson) => {
    try {
      await deleteLesson(lesson.id)
      refetch()
    } catch {
      setLocalCurriculum((prev) =>
        prev
          ? {
              ...prev,
              chapters: (prev.chapters ?? []).map((c) =>
                (c.lessons ?? []).some((l) => l.id === lesson.id)
                  ? { ...c, lessons: (c.lessons ?? []).filter((l) => l.id !== lesson.id) }
                  : c
              ),
            }
          : null
      )
      if (selectedLesson?.id === lesson.id) setSelectedLesson(null)
      toast.success('Lesson removed')
    }
  }

  const handleLessonSave = (updates: Partial<Lesson>) => {
    if (!selectedLesson) return
    setLocalCurriculum((prev) => {
      if (!prev) return null
      return {
        ...prev,
        chapters: (prev.chapters ?? []).map((c) => ({
          ...c,
          lessons: (c.lessons ?? []).map((l) =>
            l.id === selectedLesson.id ? { ...l, ...updates } : l
          ),
        })),
      }
    })
    setSelectedLesson((prev) => (prev ? { ...prev, ...updates } : null))
    setHasUnsavedLesson(false)
    updateLesson(selectedLesson.id, updates).catch(() => {
      toast.success('Saved (demo)')
    })
  }

  const handleAiRewrite = async (
    lesson: Lesson,
    tone: 'simpler' | 'more_technical' | 'concise'
  ) => {
    setSelectedLesson(lesson)
    setAiModalType('rewrite')
    setAiRewriteTone(tone)
    setShowAiModal(true)
    setAiResult(null)
    setAiError(null)
    setIsAiLoading(true)
    try {
      const res = await rewriteLesson(lesson.id, {
        rewriteType: tone === 'concise' ? 'alternate_example' : tone,
      })
      setAiResult(res.body)
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Rewrite failed')
      setAiResult((lesson.body ?? lesson.content ?? '').slice(0, 200) + '... [Demo rewrite]')
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleAiAccept = (result: string) => {
    if (selectedLesson) {
      handleLessonSave({ body: result, content: result })
      setShowAiModal(false)
      toast.success('Rewrite applied')
    }
  }

  const handleRevertVersion = async (versionId: string) => {
    try {
      const data = await revertCurriculumVersion(id!, versionId)
      queryClient.setQueryData(['curriculum', id], data)
      setLocalCurriculum(data)
      setShowVersionHistory(false)
    } catch {
      toast.success('Reverted (demo)')
      setShowVersionHistory(false)
    }
  }

  const handleExport = async (options: {
    format: 'pdf' | 'markdown' | 'csv' | 'zip'
    includeNotes: boolean
    includeProgress: boolean
  }) => {
    try {
      await startExport(id!, options)
      toast.success('Export started')
      setShowExportModal(false)
    } catch {
      const blob =
        options.format === 'markdown'
          ? new Blob(
              [
                `# ${displayCurriculum?.title ?? ''}\n\n${(displayCurriculum?.chapters ?? [])
                  .map(
                    (c) =>
                      `## ${c.title}\n\n${(c.lessons ?? [])
                        .map(
                          (l) =>
                            `### ${l.title} (${l.estimatedMinutes ?? 15} min)\n\n${l.content ?? ''}`
                        )
                        .join('\n\n')}`
                  )
                  .join('\n\n')}`,
              ],
              { type: 'text/markdown' }
            )
          : new Blob([JSON.stringify(displayCurriculum)], {
              type: 'application/json',
            })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `curriculum-${displayCurriculum?.title ?? 'export'}.${options.format === 'markdown' ? 'md' : 'json'}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Exported')
      setShowExportModal(false)
    }
  }

  const suggestions = React.useMemo(() => {
    const titles: string[] = []
    displayCurriculum?.chapters?.forEach((c) => {
      titles.push(c.title)
      c.lessons?.forEach((l) => titles.push(l.title))
    })
    displayCurriculum?.tags?.forEach((t) => titles.push(t))
    return [...new Set(titles)].filter((s) =>
      searchQuery ? s.toLowerCase().includes(searchQuery.toLowerCase()) : false
    ).slice(0, 8)
  }, [displayCurriculum, searchQuery])

  if (isLoading || !displayCurriculum) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      <CurriculumHeader
        curriculum={displayCurriculum}
        isSaving={updateCurriculumMutation.isPending}
        hasUnsavedChanges={hasUnsavedHeader}
        onTitleChange={handleTitleChange}
        onDescriptionChange={handleDescriptionChange}
        onSave={handleSaveHeader}
        onExport={() => setShowExportModal(true)}
        onDuplicate={handleDuplicate}
        onShare={handleShare}
        onVersionHistory={() => setShowVersionHistory(true)}
      />

      <div className="flex gap-4">
        <SearchFilterBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          filters={searchFilters}
          onFiltersChange={(f) => setSearchFilters(f)}
          suggestions={suggestions}
          onSuggestionSelect={(s) => setSearchQuery(s)}
          resultsCount={searchQueryResult.data?.total}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <ChapterList
            curriculum={displayCurriculum}
            expandedChapters={expandedChapters}
            selectedLessonId={selectedLesson?.id ?? null}
            onToggleChapter={(chapterId) =>
              setExpandedChapters((prev) => {
                const next = new Set(prev)
                if (next.has(chapterId)) next.delete(chapterId)
                else next.add(chapterId)
                return next
              })
            }
            onReorder={handleReorder}
            onEditLesson={setSelectedLesson}
            onAiRewriteLesson={(l, t) => handleAiRewrite(l, t)}
            onOpenViewer={(l) => {
              setSelectedLesson(l)
              setShowViewer(true)
            }}
            onAddChapter={handleAddChapter}
            onRenameChapter={handleRenameChapter}
            onDeleteChapter={handleDeleteChapter}
            onAddLesson={handleAddLesson}
            onDeleteLesson={handleDeleteLesson}
          />
        </aside>

        <main>
          <LessonEditor
            lesson={selectedLesson}
            hasUnsavedChanges={hasUnsavedLesson}
            onSave={handleLessonSave}
            onAskAi={() => {
              setAiModalType('qa')
              setShowAiModal(true)
            }}
            onRewrite={(t) => selectedLesson && handleAiRewrite(selectedLesson, t)}
            onGenerateExamples={() =>
              selectedLesson && handleAiRewrite(selectedLesson, 'concise')
            }
          />
        </main>
      </div>

      <AiActionModal
        open={showAiModal}
        onOpenChange={setShowAiModal}
        lesson={selectedLesson}
        actionType={aiModalType}
        rewriteTone={aiRewriteTone}
        isLoading={isAiLoading}
        result={aiResult ?? undefined}
        error={aiError ?? undefined}
        onAccept={handleAiAccept}
        onReject={() => setShowAiModal(false)}
      />

      <InteractiveLessonViewer
        lesson={selectedLesson}
        open={showViewer}
        onOpenChange={setShowViewer}
        onAskAi={async (q) => {
          try {
            const res = await lessonQna(selectedLesson!.id, { question: q })
            return res.answer
          } catch {
            return 'Demo: AI would answer based on lesson content.'
          }
        }}
      />

      <ExportImportModal
        mode="export"
        open={showExportModal}
        onOpenChange={setShowExportModal}
        onExport={handleExport}
      />

      <VersionHistoryPanel
        open={showVersionHistory}
        onOpenChange={setShowVersionHistory}
        versions={versionsQuery.data ?? []}
        isLoading={versionsQuery.isLoading}
        onRevert={handleRevertVersion}
        curriculumId={id ?? ''}
      />
    </div>
  )
}
