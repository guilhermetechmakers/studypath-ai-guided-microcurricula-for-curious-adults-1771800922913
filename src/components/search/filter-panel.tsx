import * as React from 'react'
import { X, Filter as FilterIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { SearchFilters, CurriculumSource, CurriculumDepth, SearchFacets } from '@/types/search'

const SOURCES: { value: CurriculumSource; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'curated', label: 'Curated' },
  { value: 'user', label: 'User' },
]

const DEPTHS: { value: CurriculumDepth; label: string }[] = [
  { value: 'intro', label: 'Intro' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'deep', label: 'Deep' },
]

const TIME_BUCKETS = [
  { label: '<1h', min: 0, max: 60 },
  { label: '1–3h', min: 60, max: 180 },
  { label: '3–10h', min: 180, max: 600 },
  { label: '10+h', min: 600, max: 10000 },
]

export interface FilterPanelProps {
  filters: SearchFilters
  onFiltersChange: (f: SearchFilters) => void
  facets?: SearchFacets
  authorSuggestions?: string[]
  onAuthorSearch?: (q: string) => void
  className?: string
  isCollapsed?: boolean
  onToggleCollapsed?: () => void
}

export function FilterPanel({
  filters,
  onFiltersChange,
  facets = {},
  authorSuggestions = [],
  onAuthorSearch,
  className,
  isCollapsed = false,
  onToggleCollapsed,
}: FilterPanelProps) {
  const [authorQuery, setAuthorQuery] = React.useState('')
  const [showAuthorDropdown, setShowAuthorDropdown] = React.useState(false)

  const hasActiveFilters =
    (filters.topics?.length ?? 0) > 0 ||
    (filters.source?.length ?? 0) > 0 ||
    filters.depth != null ||
    filters.timeMin != null ||
    filters.timeMax != null ||
    (filters.popularityMin ?? 0) > 0 ||
    filters.language != null

  const clearFilters = () => {
    onFiltersChange({})
    setAuthorQuery('')
  }

  const toggleTopic = (topic: string) => {
    const current = filters.topics ?? []
    const next = current.includes(topic)
      ? current.filter((t) => t !== topic)
      : [...current, topic].slice(0, 10)
    onFiltersChange({ ...filters, topics: next })
  }

  const toggleSource = (source: CurriculumSource) => {
    const current = filters.source ?? []
    const next = current.includes(source)
      ? current.filter((s) => s !== source)
      : [...current, source]
    onFiltersChange({ ...filters, source: next })
  }

  const setDepth = (depth: CurriculumDepth | undefined) => {
    onFiltersChange({ ...filters, depth })
  }

  const setTimeRange = (min: number | undefined, max: number | undefined) => {
    onFiltersChange({ ...filters, timeMin: min, timeMax: max })
  }

  const DEFAULT_TOPICS = [
    { value: 'history', count: 0 },
    { value: 'science', count: 0 },
    { value: 'philosophy', count: 0 },
    { value: 'art', count: 0 },
    { value: 'technology', count: 0 },
    { value: 'literature', count: 0 },
  ]
  const topicFacets = (facets.topics?.length ?? 0) > 0 ? facets.topics! : DEFAULT_TOPICS
  const selectedTopics = filters.topics ?? []
  const selectedSources = filters.source ?? []

  return (
    <>
      {isCollapsed && onToggleCollapsed && (
        <Button
          variant="secondary"
          className="lg:hidden fixed bottom-4 left-4 z-40"
          onClick={onToggleCollapsed}
          aria-expanded={false}
        >
          <FilterIcon className="h-4 w-4 mr-2" />
          Filters
        </Button>
      )}
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-card/50 transition-all duration-300 shrink-0',
          isCollapsed ? 'w-0 overflow-hidden' : 'w-64',
          'lg:w-64 lg:overflow-visible',
          className
        )}
        aria-label="Filter panel"
      >
      <div className={cn('flex flex-col h-full', isCollapsed && 'hidden')}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-sm font-semibold">Filters</h3>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" />
              Clear filters
            </Button>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Topics */}
            {topicFacets.length > 0 && (
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
                  Topics
                </label>
                <div className="flex flex-wrap gap-2">
                  {topicFacets.map(({ value, count }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleTopic(value)}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                        selectedTopics.includes(value)
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted/30 text-muted-foreground hover:bg-accent/10'
                      )}
                    >
                      {value} ({count})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Source */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
                Source
              </label>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleSource(s.value)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                      selectedSources.includes(s.value)
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted/30 text-muted-foreground hover:bg-accent/10'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Depth */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
                Depth
              </label>
              <div className="flex flex-wrap gap-2">
                {DEPTHS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDepth(filters.depth === d.value ? undefined : d.value)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                      filters.depth === d.value
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-muted/30 text-muted-foreground hover:bg-accent/10'
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time estimate */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
                Time estimate
              </label>
              <div className="flex flex-wrap gap-2">
                {TIME_BUCKETS.map((b) => {
                  const isActive =
                    filters.timeMin === b.min && filters.timeMax === b.max
                  return (
                    <button
                      key={b.label}
                      type="button"
                      onClick={() =>
                        setTimeRange(
                          isActive ? undefined : b.min,
                          isActive ? undefined : b.max
                        )
                      }
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200',
                        isActive
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-muted/30 text-muted-foreground hover:bg-accent/10'
                      )}
                    >
                      {b.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Popularity */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
                Min adoptions
              </label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[filters.popularityMin ?? 0]}
                  onValueChange={([v]) =>
                    onFiltersChange({ ...filters, popularityMin: v })
                  }
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8">
                  {filters.popularityMin ?? 0}
                </span>
              </div>
            </div>

            {/* Author (autocomplete) */}
            {onAuthorSearch && (
              <div className="relative">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">
                  Author
                </label>
                <Input
                  value={authorQuery}
                  onChange={(e) => {
                    setAuthorQuery(e.target.value)
                    onAuthorSearch(e.target.value)
                    setShowAuthorDropdown(true)
                  }}
                  onFocus={() => authorSuggestions.length > 0 && setShowAuthorDropdown(true)}
                  onBlur={() => setTimeout(() => setShowAuthorDropdown(false), 150)}
                  placeholder="Search authors…"
                  className="h-9"
                />
                {showAuthorDropdown && authorSuggestions.length > 0 && (
                  <ul
                    className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-card shadow-lg py-2 z-50 max-h-40 overflow-y-auto"
                    role="listbox"
                  >
                    {authorSuggestions.map((name) => (
                      <li key={name}>
                        <button
                          type="button"
                          className="w-full text-left px-4 py-2 text-sm hover:bg-accent/10"
                          onClick={() => {
                            setAuthorQuery(name)
                            onFiltersChange({ ...filters, authorId: name })
                            setShowAuthorDropdown(false)
                          }}
                          role="option"
                        >
                          {name}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
    </>
  )
}
