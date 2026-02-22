import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
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
import type { Curriculum, Chapter, Lesson, ReorderPayload } from '@/types/curriculum'

const CURRICULUM_KEY = 'curriculum'
const VERSIONS_KEY = 'curriculum-versions'
const SEARCH_KEY = 'search'

export function useCurriculumDetail(id: string | undefined) {
  const queryClient = useQueryClient()

  const curriculumQuery = useQuery({
    queryKey: [CURRICULUM_KEY, id],
    queryFn: () => getCurriculumDetail(id!),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Curriculum>) =>
      updateCurriculumDetail(id!, updates),
    onSuccess: (data) => {
      queryClient.setQueryData([CURRICULUM_KEY, id], data)
      toast.success('Saved')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: () => duplicateCurriculum(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['curricula'] })
      toast.success('Curriculum duplicated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Duplicate failed')
    },
  })

  const createChapterMutation = useMutation({
    mutationFn: (title: string) => createChapter(id!, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CURRICULUM_KEY, id] })
      toast.success('Chapter added')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add chapter')
    },
  })

  const updateChapterMutation = useMutation({
    mutationFn: ({ chapterId, updates }: { chapterId: string; updates: Partial<Chapter> }) =>
      updateChapter(chapterId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CURRICULUM_KEY, id] })
      toast.success('Chapter updated')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Update failed')
    },
  })

  const deleteChapterMutation = useMutation({
    mutationFn: (chapterId: string) => deleteChapter(chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CURRICULUM_KEY, id] })
      toast.success('Chapter deleted')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Delete failed')
    },
  })

  const reorderMutation = useMutation({
    mutationFn: (payload: ReorderPayload) => reorderCurriculum(id!, payload),
    onSuccess: (data) => {
      queryClient.setQueryData([CURRICULUM_KEY, id], data)
      toast.success('Reordered')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Reorder failed')
    },
  })

  const updateLessonMutation = useMutation({
    mutationFn: ({ lessonId, updates }: { lessonId: string; updates: Partial<Lesson> }) =>
      updateLesson(lessonId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CURRICULUM_KEY, id] })
      toast.success('Lesson saved')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    },
  })

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CURRICULUM_KEY, id] })
      toast.success('Lesson removed')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Remove failed')
    },
  })

  const createLessonMutation = useMutation({
    mutationFn: ({ chapterId, data }: { chapterId: string; data: Partial<Lesson> }) =>
      createLesson(chapterId, id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CURRICULUM_KEY, id] })
      toast.success('Lesson added')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add lesson')
    },
  })

  return {
    curriculum: curriculumQuery.data,
    isLoading: curriculumQuery.isLoading,
    error: curriculumQuery.error,
    refetch: curriculumQuery.refetch,
    updateCurriculum: updateMutation.mutateAsync,
    duplicateCurriculum: duplicateMutation.mutateAsync,
    createChapter: createChapterMutation.mutateAsync,
    updateChapter: updateChapterMutation.mutateAsync,
    deleteChapter: deleteChapterMutation.mutateAsync,
    reorder: reorderMutation.mutateAsync,
    updateLesson: updateLessonMutation.mutateAsync,
    deleteLesson: deleteLessonMutation.mutateAsync,
    createLesson: createLessonMutation.mutateAsync,
    startExport,
  }
}

export function useCurriculumVersions(curriculumId: string | undefined) {
  const queryClient = useQueryClient()

  const versionsQuery = useQuery({
    queryKey: [VERSIONS_KEY, curriculumId],
    queryFn: () => getCurriculumVersions(curriculumId!),
    enabled: !!curriculumId,
  })

  const revertMutation = useMutation({
    mutationFn: (versionId: string) =>
      revertCurriculumVersion(curriculumId!, versionId),
    onSuccess: (data) => {
      queryClient.setQueryData([CURRICULUM_KEY, curriculumId], data)
      queryClient.invalidateQueries({ queryKey: [VERSIONS_KEY, curriculumId] })
      toast.success('Reverted to previous version')
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Revert failed')
    },
  })

  return {
    versions: versionsQuery.data ?? [],
    isLoading: versionsQuery.isLoading,
    refetch: versionsQuery.refetch,
    revert: revertMutation.mutateAsync,
    isReverting: revertMutation.isPending,
  }
}

export function useLessonRewrite(lessonId: string | undefined) {
  return useMutation({
    mutationFn: (params: {
      rewriteType: 'simpler' | 'more_technical' | 'concise' | 'alternate_example'
    }) =>
      rewriteLesson(lessonId!, {
        rewriteType:
          params.rewriteType === 'concise' ? 'alternate_example' : params.rewriteType,
      }),
  })
}

export function useLessonQna(lessonId: string | undefined) {
  return useMutation({
    mutationFn: (question: string) => lessonQna(lessonId!, { question }),
  })
}

export function useCurriculumSearch(q: string, filters?: Record<string, string | string[]>) {
  return useQuery({
    queryKey: [SEARCH_KEY, q, filters],
    queryFn: () => search({ q, filters }),
    enabled: q.length >= 2,
  })
}
