/** Search & Browse Curricula - Type definitions */

export type SearchMode = 'blended' | 'keyword' | 'semantic'

export type CurriculumSource = 'public' | 'curated' | 'user'

export type CurriculumDepth = 'intro' | 'intermediate' | 'deep'

export type SortOption = 'relevance' | 'newest' | 'highest_rated' | 'most_adopted'

export interface SearchFilters {
  topics?: string[]
  source?: CurriculumSource[]
  authorId?: string
  depth?: CurriculumDepth
  timeMin?: number
  timeMax?: number
  timeBucket?: TimeEstimateBucket
  popularityMin?: number
  language?: string
}

export type TimeEstimateBucket = 'under_1h' | '1_3h' | '3_10h' | '10_plus'

export interface CurriculumSearchParams {
  q: string
  mode?: SearchMode
  filters?: SearchFilters
  sort?: SortOption
  cursor?: string
  pageSize?: number
}

export interface CurriculumSearchResult {
  id: string
  title: string
  description?: string
  topics: string[]
  authorId?: string
  authorName?: string
  source: CurriculumSource
  depth: CurriculumDepth
  timeEstimateMinutes: number
  ratingAvg?: number
  adoptionCount: number
  thumbnail?: string
  highlightSnippet?: string
  score?: number
  isSaved?: boolean
  isAdopted?: boolean
}

export interface CurriculumSearchResponse {
  results: CurriculumSearchResult[]
  nextCursor?: string
  facets?: SearchFacets
}

export interface SearchFacets {
  topics?: { value: string; count: number }[]
  sources?: { value: CurriculumSource; count: number }[]
  depths?: { value: CurriculumDepth; count: number }[]
}

export type AutosuggestType = 'title' | 'topic' | 'author' | 'query'

export interface AutosuggestItem {
  type: AutosuggestType
  text: string
  meta?: string
}

export interface AutosuggestResponse {
  suggestions: AutosuggestItem[]
}

export interface CurriculumDetailResponse {
  id: string
  title: string
  description?: string
  topics: string[]
  authorId?: string
  authorName?: string
  source: CurriculumSource
  depth: CurriculumDepth
  timeEstimateMinutes: number
  ratingAvg?: number
  adoptionCount: number
  commentsCount?: number
  lessons: CurriculumLessonSummary[]
  sampleLessonBody?: string
  isSaved?: boolean
  isAdopted?: boolean
}

export interface CurriculumLessonSummary {
  id: string
  title: string
  timeEstimateMinutes: number
  orderIndex: number
  summary?: string
  bodyPreview?: string
}

export type CurriculumPreviewDetail = CurriculumDetailResponse

export interface AdoptResponse {
  userCurriculumId: string
  status: 'adopted'
}

export interface SaveResponse {
  saved: boolean
}
