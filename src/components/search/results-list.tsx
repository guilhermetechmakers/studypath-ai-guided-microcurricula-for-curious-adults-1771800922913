import * as React from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Search } from 'lucide-react'
import { CurriculumCard } from './curriculum-card'
import { SortingControl } from './sorting-control'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type {
  CurriculumSearchResult,
  SortOption,
} from '@/types/search'

export interface ResultsListProps {
  results: CurriculumSearchResult[]
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  onPreview: (id: string) => void
  onSave?: (id: string) => void
  onAdopt?: (id: string) => void
  isLoading?: boolean
  isFetchingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  savingId?: string
  adoptingId?: string
  className?: string
}

export function ResultsList({
  results,
  sort,
  onSortChange,
  onPreview,
  onSave,
  onAdopt,
  isLoading = false,
  isFetchingMore = false,
  hasMore = false,
  onLoadMore,
  savingId,
  adoptingId,
  className,
}: ResultsListProps) {
  const loadMoreRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!onLoadMore || !hasMore || isFetchingMore) return
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMore()
      },
      { rootMargin: '100px', threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [onLoadMore, hasMore, isFetchingMore])

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex justify-end">
          <Skeleton className="h-11 w-[180px]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p
          className="text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {results.length} result{results.length !== 1 ? 's' : ''} found
        </p>
        <SortingControl value={sort} onChange={onSortChange} />
      </div>

      {results.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((c, i) => (
              <div
                key={c.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
              >
                <CurriculumCard
                  curriculum={c}
                  onPreview={onPreview}
                  onSave={onSave}
                  onAdopt={onAdopt}
                  isSaving={savingId === c.id}
                  isAdopting={adoptingId === c.id}
                />
              </div>
            ))}
          </div>
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isFetchingMore ? (
                <Skeleton className="h-12 w-48" />
              ) : (
                <Button variant="secondary" onClick={onLoadMore}>
                  Load more
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted/30 p-6 mb-4">
        <Search className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No curricula found</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Try adjusting your search or filters. You can also browse popular
        curricula or create your own.
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button variant="secondary" asChild>
          <Link to="/dashboard/create">
            <BookOpen className="h-4 w-4 mr-2" />
            Create curriculum
          </Link>
        </Button>
      </div>
    </div>
  )
}
