import * as React from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface SearchFilters {
  tags?: string[]
  estimatedTimeMin?: number
  estimatedTimeMax?: number
  hasMedia?: boolean
  completeness?: 'all' | 'in_progress' | 'completed'
}

interface SearchFilterBarProps {
  query: string
  onQueryChange: (q: string) => void
  filters?: SearchFilters
  onFiltersChange?: (f: SearchFilters) => void
  suggestions?: string[]
  onSuggestionSelect?: (s: string) => void
  resultsCount?: number
  placeholder?: string
  className?: string
}

export function SearchFilterBar({
  query,
  onQueryChange,
  filters = {},
  onFiltersChange,
  suggestions = [],
  onSuggestionSelect,
  resultsCount,
  placeholder = 'Search curriculum, lessons, tags...',
  className,
}: SearchFilterBarProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [showFilters, setShowFilters] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const hasActiveFilters =
    (filters.tags?.length ?? 0) > 0 ||
    filters.estimatedTimeMin != null ||
    filters.estimatedTimeMax != null ||
    filters.hasMedia != null ||
    (filters.completeness && filters.completeness !== 'all')

  const clearFilters = () => {
    onFiltersChange?.({})
  }

  return (
    <div className={cn('relative', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
            placeholder={placeholder}
            className="pl-9 pr-4"
            aria-label="Search"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={() => onQueryChange('')}
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          {isFocused && suggestions.length > 0 && (
            <ul
              className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-card shadow-lg py-2 z-50 max-h-48 overflow-y-auto"
              role="listbox"
            >
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 hover:bg-accent/10 text-sm"
                    onClick={() => {
                      onSuggestionSelect?.(s)
                      onQueryChange(s)
                      setIsFocused(false)
                    }}
                    role="option"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <DropdownMenu open={showFilters} onOpenChange={setShowFilters}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className={hasActiveFilters ? 'border-accent' : ''}
              aria-label="Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filters</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filters.hasMedia === true}
              onCheckedChange={(checked) =>
                onFiltersChange?.({ ...filters, hasMedia: checked ? true : undefined })
              }
            >
              Has media
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Completeness</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filters.completeness === 'all' || !filters.completeness}
              onCheckedChange={(checked) =>
                checked && onFiltersChange?.({ ...filters, completeness: 'all' })
              }
            >
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.completeness === 'in_progress'}
              onCheckedChange={(checked) =>
                checked && onFiltersChange?.({ ...filters, completeness: 'in_progress' })
              }
            >
              In progress
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.completeness === 'completed'}
              onCheckedChange={(checked) =>
                checked && onFiltersChange?.({ ...filters, completeness: 'completed' })
              }
            >
              Completed
            </DropdownMenuCheckboxItem>
            {hasActiveFilters && (
              <>
                <DropdownMenuSeparator />
                <button
                  type="button"
                  className="w-full text-left px-2 py-1.5 text-sm text-accent hover:bg-accent/10"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {resultsCount != null && query && (
        <p className="text-xs text-muted-foreground mt-1">
          {resultsCount} result{resultsCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
