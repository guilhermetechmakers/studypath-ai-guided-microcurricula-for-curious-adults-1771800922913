import { apiGet, apiPost } from '@/lib/api'
import type {
  CurriculumSearchParams,
  CurriculumSearchResponse,
  AutosuggestResponse,
  AdoptResponse,
  SaveResponse,
} from '@/types/search'

/** Search curricula with hybrid keyword + semantic search */
export async function searchCurricula(
  params: CurriculumSearchParams
): Promise<CurriculumSearchResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set('q', params.q)
  if (params.mode) searchParams.set('mode', params.mode)
  if (params.sort) searchParams.set('sort', params.sort)
  if (params.cursor) searchParams.set('cursor', params.cursor)
  if (params.pageSize) searchParams.set('page_size', String(params.pageSize))

  const filters = params.filters
  if (filters?.topics?.length) {
    filters.topics.forEach((t) => searchParams.append('topics[]', t))
  }
  if (filters?.source?.length) {
    filters.source.forEach((s) => searchParams.append('source[]', s))
  }
  if (filters?.authorId) searchParams.set('author_id', filters.authorId)
  if (filters?.depth) searchParams.set('depth', filters.depth)
  if (filters?.timeBucket) {
    const map: Record<string, { min?: number; max?: number }> = {
      under_1h: { min: 0, max: 60 },
      '1_3h': { min: 60, max: 180 },
      '3_10h': { min: 180, max: 600 },
      '10_plus': { min: 600 },
    }
    const range = map[filters.timeBucket]
    if (range?.min != null) searchParams.set('time_min', String(range.min))
    if (range?.max != null) searchParams.set('time_max', String(range.max))
  }
  if (filters?.timeMin != null) searchParams.set('time_min', String(filters.timeMin))
  if (filters?.timeMax != null) searchParams.set('time_max', String(filters.timeMax))
  if (filters?.popularityMin != null) searchParams.set('popularity_min', String(filters.popularityMin))
  if (filters?.language) searchParams.set('language', filters.language)

  try {
    return await apiGet<CurriculumSearchResponse>(`/search/curricula?${searchParams.toString()}`)
  } catch {
    const mock: CurriculumSearchResponse['results'] = [
      { id: '1', title: 'History of Troy', description: 'Explore the archaeological and literary evidence for ancient Troy.', topics: ['history', 'archaeology'], source: 'curated', depth: 'intermediate', timeEstimateMinutes: 65, adoptionCount: 42, highlightSnippet: 'The history of Troy spans myth and archaeology…' },
      { id: '2', title: 'Introduction to Ancient Greece', description: 'A survey of Greek history, culture, and philosophy.', topics: ['history', 'philosophy'], source: 'public', depth: 'intro', timeEstimateMinutes: 120, adoptionCount: 128 },
      { id: '3', title: 'Roman Empire Foundations', description: 'From Republic to Empire: key political and military developments.', topics: ['history', 'politics'], source: 'public', depth: 'intermediate', timeEstimateMinutes: 150, adoptionCount: 89 },
    ]
    const filtered = params.q
      ? mock.filter((r) => r.title.toLowerCase().includes(params.q.toLowerCase()) || r.topics.some((t) => t.toLowerCase().includes(params.q.toLowerCase())))
      : mock
    return { results: filtered, nextCursor: undefined }
  }
}

/** Autosuggest for search bar */
export async function getAutosuggest(q: string, limit = 10): Promise<AutosuggestResponse> {
  const params = new URLSearchParams({ q, limit: String(limit) })
  try {
    return await apiGet<AutosuggestResponse>(`/search/autosuggest?${params.toString()}`)
  } catch {
    const suggestions: AutosuggestResponse['suggestions'] = [
      { type: 'title', text: 'History of Troy' },
      { type: 'topic', text: 'history' },
      { type: 'topic', text: 'archaeology' },
      { type: 'author', text: 'StudyPath Curated' },
      { type: 'query', text: 'ancient civilizations' },
    ]
    const filtered = q.trim()
      ? suggestions.filter((s) => s.text.toLowerCase().includes(q.toLowerCase()))
      : suggestions
    return { suggestions: filtered.length ? filtered : suggestions }
  }
}

/** Adopt curriculum into user library */
export async function adoptCurriculum(
  userId: string,
  curriculumId: string,
  cloneOptions?: Record<string, unknown>
): Promise<AdoptResponse> {
  return apiPost<AdoptResponse>(`/users/${userId}/library/adopt`, {
    curriculum_id: curriculumId,
    clone_options: cloneOptions,
  })
}

/** Save (bookmark) curriculum */
export async function saveCurriculum(userId: string, curriculumId: string): Promise<SaveResponse> {
  return apiPost<SaveResponse>(`/users/${userId}/saved-curricula`, { curriculum_id: curriculumId })
}

/** Log search analytics event */
export async function logSearchEvent(params: {
  userId?: string
  query: string
  filters?: Record<string, unknown>
  resultCount: number
  timestamp?: string
}): Promise<void> {
  await apiPost('/analytics/search-event', {
    user_id: params.userId,
    query: params.query,
    filters: params.filters,
    result_count: params.resultCount,
    timestamp: params.timestamp ?? new Date().toISOString(),
  })
}
