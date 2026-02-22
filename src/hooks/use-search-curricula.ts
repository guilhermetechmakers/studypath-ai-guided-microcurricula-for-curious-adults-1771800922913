import { useInfiniteQuery } from '@tanstack/react-query'
import { searchCurricula } from '@/api/search-curricula'
import type {
  CurriculumSearchParams,
  CurriculumSearchResult,
  SearchFacets,
} from '@/types/search'

const MOCK_RESULTS: CurriculumSearchResult[] = [
  {
    id: '1',
    title: 'History of Troy',
    description: 'Explore the myth, archaeology, and legacy of ancient Troy.',
    topics: ['history', 'archaeology', 'mythology'],
    authorName: 'StudyPath',
    source: 'curated',
    depth: 'intermediate',
    timeEstimateMinutes: 65,
    ratingAvg: 4.5,
    adoptionCount: 42,
    highlightSnippet: 'The Trojan War has been a central theme in Greek mythology...',
    isSaved: false,
    isAdopted: false,
  },
  {
    id: '2',
    title: 'Introduction to Ancient Greece',
    description: 'From Homer to Alexander: a survey of Greek civilization.',
    topics: ['history', 'philosophy'],
    authorName: 'StudyPath',
    source: 'public',
    depth: 'intro',
    timeEstimateMinutes: 120,
    ratingAvg: 4.8,
    adoptionCount: 89,
    isSaved: false,
    isAdopted: false,
  },
  {
    id: '3',
    title: 'Roman Empire Foundations',
    description: 'Rise and governance of the Roman Empire.',
    topics: ['history', 'politics'],
    authorName: 'StudyPath',
    source: 'curated',
    depth: 'deep',
    timeEstimateMinutes: 150,
    ratingAvg: 4.2,
    adoptionCount: 31,
    isSaved: false,
    isAdopted: false,
  },
]

const MOCK_FACETS: SearchFacets = {
  topics: [
    { value: 'history', count: 12 },
    { value: 'archaeology', count: 4 },
    { value: 'mythology', count: 3 },
    { value: 'philosophy', count: 5 },
    { value: 'politics', count: 2 },
  ],
  sources: [
    { value: 'public', count: 8 },
    { value: 'curated', count: 5 },
    { value: 'user', count: 2 },
  ],
  depths: [
    { value: 'intro', count: 6 },
    { value: 'intermediate', count: 7 },
    { value: 'deep', count: 2 },
  ],
}

async function fetchWithMockFallback(
  params: CurriculumSearchParams,
  cursor?: string
): Promise<{ results: CurriculumSearchResult[]; nextCursor?: string; facets?: SearchFacets }> {
  try {
    const res = await searchCurricula({
      ...params,
      cursor,
      pageSize: params.pageSize ?? 12,
    })
    return res
  } catch {
    const filtered = MOCK_RESULTS.filter((r) => {
      if (params.q && !r.title.toLowerCase().includes(params.q.toLowerCase()) &&
          !r.topics.some((t) => t.toLowerCase().includes(params.q.toLowerCase()))) {
        return false
      }
      if (params.filters?.topics?.length) {
        if (!params.filters.topics.some((t) => r.topics.includes(t))) return false
      }
      if (params.filters?.depth && r.depth !== params.filters.depth) return false
      return true
    })
    return {
      results: filtered,
      nextCursor: filtered.length >= 12 ? 'mock-cursor' : undefined,
      facets: MOCK_FACETS,
    }
  }
}

const QUERY_KEY = ['search', 'curricula'] as const

export function useSearchCurricula(params: CurriculumSearchParams) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: ({ pageParam }) =>
      fetchWithMockFallback(params, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  })
}
