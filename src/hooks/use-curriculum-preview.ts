import { useQuery } from '@tanstack/react-query'
import { getCurriculumDetail } from '@/api/curriculum-detail'
import type { Curriculum } from '@/types/curriculum'
import type { CurriculumDetailResponse, CurriculumDepth } from '@/types/search'

function mapCurriculumToDetail(c: Curriculum): CurriculumDetailResponse {
  const lessons: CurriculumDetailResponse['lessons'] = []
  let orderIndex = 0
  const chapters = (c.chapters ?? []).sort(
    (a, b) => (a.order_index ?? a.order ?? 0) - (b.order_index ?? b.order ?? 0)
  )
  for (const ch of chapters) {
    const sortedLessons = (ch.lessons ?? []).sort(
      (a, b) => (a.order_index ?? a.position ?? 0) - (b.order_index ?? b.position ?? 0)
    )
    for (const l of sortedLessons) {
      const body = l.body ?? l.content ?? ''
      const bodyPreview = body
        ? body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300) + (body.length > 300 ? '…' : '')
        : undefined
      lessons.push({
        id: l.id,
        title: l.title,
        timeEstimateMinutes: l.estimatedMinutes,
        orderIndex: orderIndex++,
        summary: l.summary,
        bodyPreview,
      })
    }
  }
  const firstLesson = (chapters[0]?.lessons ?? [])[0]
  const sampleBody = firstLesson
    ? ((firstLesson.body ?? firstLesson.content ?? '').replace(/<[^>]*>/g, ' ').trim().slice(0, 500) + '…')
    : undefined

  const depth = (c.parameters?.depth ?? 2) as number
  const depthMap: CurriculumDepth[] = ['intro', 'intermediate', 'deep']
  const depthVal = depthMap[Math.min(Math.max(0, depth - 1), 2)] ?? 'intermediate'

  return {
    id: c.id,
    title: c.title,
    description: c.description,
    topics: c.tags ?? [],
    authorId: c.userId ?? c.user_id,
    authorName: undefined,
    source: 'public',
    depth: depthVal,
    timeEstimateMinutes: c.totalEstimatedMinutes ?? c.total_estimated_minutes ?? 0,
    ratingAvg: undefined,
    adoptionCount: 0,
    lessons,
    sampleLessonBody: sampleBody,
    isSaved: false,
    isAdopted: c.status === 'adopted',
  }
}

const QUERY_KEY = ['curriculum', 'preview'] as const

export function useCurriculumPreview(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: async (): Promise<CurriculumDetailResponse | null> => {
      if (!id) return null
      const c = await getCurriculumDetail(id)
      return mapCurriculumToDetail(c)
    },
    enabled: !!id && enabled,
  })
}
