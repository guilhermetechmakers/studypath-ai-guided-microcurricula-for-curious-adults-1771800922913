import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchBar } from '@/components/search/search-bar'
import { FilterPanel } from '@/components/search/filter-panel'
import { ResultsList } from '@/components/search/results-list'
import { CurriculumPreviewDrawer } from '@/components/search/curriculum-preview-drawer'
import { useDebounce } from '@/hooks/use-debounce'
import { useAutosuggest } from '@/hooks/use-autosuggest'
import { useSearchCurricula } from '@/hooks/use-search-curricula'
import { useCurriculumPreview } from '@/hooks/use-curriculum-preview'
import { useAdoptCurriculum, useSaveCurriculum } from '@/hooks/use-curriculum-adopt'
import { useAuth } from '@/contexts/auth-context'
import { logSearchEvent } from '@/api'
import type { SearchFilters, SearchMode, SortOption, TimeEstimateBucket } from '@/types/search'

const TIME_BUCKET_MAP: Record<string, { min: number; max: number }> = {
  under_1h: { min: 0, max: 60 },
  '1_3h': { min: 60, max: 180 },
  '3_10h': { min: 180, max: 600 },
  '10_plus': { min: 600, max: 10000 },
}

function parseFiltersFromUrl(params: URLSearchParams): SearchFilters {
  const topics = params.getAll('topic')
  const source = params.getAll('source') as SearchFilters['source']
  const depth = params.get('depth') as SearchFilters['depth'] | null
  const timeBucket = params.get('time_bucket') as TimeEstimateBucket | null
  const popularityMin = params.get('popularity_min')
  const range = timeBucket ? TIME_BUCKET_MAP[timeBucket] : undefined
  return {
    topics: topics.length ? topics : undefined,
    source: source?.length ? source : undefined,
    depth: depth ?? undefined,
    timeBucket: timeBucket ?? undefined,
    timeMin: range?.min,
    timeMax: range?.max,
    popularityMin: popularityMin != null ? Number(popularityMin) : undefined,
  }
}

function getTimeBucketFromRange(min?: number, max?: number): SearchFilters['timeBucket'] {
  if (min == null || max == null) return undefined
  const entry = Object.entries(TIME_BUCKET_MAP).find(
    ([_, r]) => r.min === min && r.max === max
  )
  return entry ? (entry[0] as TimeEstimateBucket) : undefined
}

function syncFiltersToUrl(params: URLSearchParams, filters: SearchFilters) {
  params.delete('topic')
  params.delete('source')
  params.delete('depth')
  params.delete('time_bucket')
  params.delete('popularity_min')
  filters.topics?.forEach((t) => params.append('topic', t))
  filters.source?.forEach((s) => params.append('source', s))
  if (filters.depth) params.set('depth', filters.depth)
  const timeBucket =
    filters.timeBucket ?? getTimeBucketFromRange(filters.timeMin, filters.timeMax)
  if (timeBucket) params.set('time_bucket', timeBucket)
  if (filters.popularityMin != null) params.set('popularity_min', String(filters.popularityMin))
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  const q = searchParams.get('q') ?? ''
  const mode = (searchParams.get('mode') ?? 'blended') as SearchMode
  const sort = (searchParams.get('sort') ?? 'relevance') as SortOption
  const filters = parseFiltersFromUrl(searchParams)

  const [query, setQuery] = useState(q)
  const [filtersCollapsed, setFiltersCollapsed] = useState(true)
  const [previewId, setPreviewId] = useState<string | null>(null)

  const debouncedQuery = useDebounce(query, 300)
  const autosuggest = useAutosuggest(query, 10)

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchCurricula({
    q: debouncedQuery,
    mode,
    filters,
    sort,
    pageSize: 20,
  })

  const { data: previewData, isLoading: previewLoading } = useCurriculumPreview(
    previewId,
    !!previewId
  )

  const adoptMutation = useAdoptCurriculum()
  const saveMutation = useSaveCurriculum()

  const results = data?.pages.flatMap((p) => p.results) ?? []

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value)
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (value) next.set('q', value)
        else next.delete('q')
        return next
      })
    },
    [setSearchParams]
  )

  const handleFiltersChange = useCallback(
    (next: SearchFilters) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        syncFiltersToUrl(nextParams, next)
        return nextParams
      })
    },
    [setSearchParams]
  )

  const handleSortChange = useCallback(
    (next: SortOption) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        nextParams.set('sort', next)
        return nextParams
      })
    },
    [setSearchParams]
  )

  const handleModeChange = useCallback(
    (next: SearchMode) => {
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev)
        nextParams.set('mode', next)
        return nextParams
      })
    },
    [setSearchParams]
  )

  useEffect(() => {
    if (query && results.length >= 0) {
      logSearchEvent({
        userId: user?.id,
        query,
        filters: filters as Record<string, unknown>,
        resultCount: results.length,
      }).catch(() => {})
    }
  }, [query, results.length, user?.id])

  useEffect(() => {
    setQuery(q)
  }, [q])

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Search & Browse Curricula
        </h1>
        <p className="text-muted-foreground mt-1">
          Discover, explore, and adopt curricula to build your learning path
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-56 xl:w-64 shrink-0">
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            facets={data?.pages[0]?.facets}
            isCollapsed={filtersCollapsed}
            onToggleCollapsed={() => setFiltersCollapsed((c) => !c)}
          />
        </aside>

        <div className="flex-1 min-w-0 space-y-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={handleSearch}
            mode={mode}
            onModeChange={handleModeChange}
            suggestions={autosuggest.data?.suggestions ?? []}
            isLoadingSuggestions={autosuggest.isFetching}
            placeholder="Search curricula, lessons, notes…"
          />

          <ResultsList
            results={results}
            isLoading={isLoading}
            isFetchingMore={isFetchingNextPage}
            hasMore={!!hasNextPage}
            onLoadMore={() => fetchNextPage()}
            sort={sort}
            onSortChange={handleSortChange}
            onPreview={setPreviewId}
            onSave={user ? (id: string) => saveMutation.mutate(id) : undefined}
            onAdopt={user ? (id: string) => adoptMutation.mutate(id) : undefined}
            savingId={saveMutation.isPending ? saveMutation.variables : undefined}
            adoptingId={adoptMutation.isPending ? adoptMutation.variables : undefined}
          />
        </div>
      </div>

      <CurriculumPreviewDrawer
        curriculumId={previewId}
        curriculum={previewData ?? null}
        isLoading={previewLoading}
        isSaved={previewData?.isSaved}
        isAdopted={previewData?.isAdopted}
        isSaving={saveMutation.isPending}
        isAdopting={adoptMutation.isPending}
        open={!!previewId}
        onClose={() => setPreviewId(null)}
        onSave={user ? (id: string) => saveMutation.mutate(id) : undefined}
        onAdopt={user ? (id: string) => adoptMutation.mutate(id) : undefined}
      />
    </div>
  )
}
