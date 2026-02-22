import * as React from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { SearchMode, AutosuggestItem } from '@/types/search'

const SEARCH_MODES: { value: SearchMode; label: string }[] = [
  { value: 'blended', label: 'Blended' },
  { value: 'keyword', label: 'Keyword' },
  { value: 'semantic', label: 'Semantic' },
]

const SUGGESTION_TYPE_LABELS: Record<string, string> = {
  title: 'Titles',
  topic: 'Topics',
  author: 'Authors',
  query: 'Popular',
}

export interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  mode: SearchMode
  onModeChange: (mode: SearchMode) => void
  suggestions?: AutosuggestItem[]
  isLoadingSuggestions?: boolean
  onSuggestionSelect?: (item: AutosuggestItem) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  'aria-label'?: string
}

export function SearchBar({
  value,
  onChange,
  onSubmit,
  mode,
  onModeChange,
  suggestions = [],
  isLoadingSuggestions = false,
  onSuggestionSelect,
  placeholder = 'Search curricula, lessons, notes…',
  className,
  inputClassName,
  'aria-label': ariaLabel = 'Search curricula',
}: SearchBarProps) {
  const [isFocused, setIsFocused] = React.useState(false)
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const showSuggestions = isFocused && value.length > 0

  const groupedSuggestions = React.useMemo(() => {
    const groups: Record<string, AutosuggestItem[]> = {}
    for (const s of suggestions) {
      const key = s.type
      if (!groups[key]) groups[key] = []
      groups[key].push(s)
    }
    return groups
  }, [suggestions])

  const flatSuggestions = React.useMemo(
    () => Object.values(groupedSuggestions).flat(),
    [groupedSuggestions]
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || flatSuggestions.length === 0) {
      if (e.key === 'Enter') onSubmit(value)
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((i) =>
          i < flatSuggestions.length - 1 ? i + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((i) =>
          i > 0 ? i - 1 : flatSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && flatSuggestions[highlightedIndex]) {
          const item = flatSuggestions[highlightedIndex]
          onSuggestionSelect?.(item)
          onChange(item.text)
          onSubmit(item.text)
          setHighlightedIndex(-1)
        } else {
          onSubmit(value)
        }
        break
      case 'Escape':
        setHighlightedIndex(-1)
        inputRef.current?.blur()
        break
      default:
        break
    }
  }

  React.useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector(`[data-index="${highlightedIndex}"]`)
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  const renderHighlightedText = (text: string, query: string) => {
    if (!query.trim()) return <>{text}</>
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const re = new RegExp(`(${escaped})`, 'gi')
    const parts = text.split(re)
    return (
      <>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <mark key={i} className="bg-accent/20 text-accent font-medium rounded px-0.5">
              {part}
            </mark>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
      </>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn('relative', className)}>
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
              aria-hidden
            />
            <Input
              ref={inputRef}
              type="search"
              value={value}
              onChange={(e) => {
                onChange(e.target.value)
                setHighlightedIndex(-1)
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn('pl-10 pr-10', inputClassName)}
              aria-label={ariaLabel}
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={showSuggestions}
              aria-activedescendant={
                highlightedIndex >= 0
                  ? `suggestion-${highlightedIndex}`
                  : undefined
              }
            />
            {value && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => {
                  onChange('')
                  setHighlightedIndex(-1)
                }}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex rounded-lg border border-input overflow-hidden">
            {SEARCH_MODES.map((m) => (
              <Tooltip key={m.value}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onModeChange(m.value)}
                    className={cn(
                      'px-3 py-2 text-xs font-medium transition-colors min-w-[44px]',
                      mode === m.value
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-background text-muted-foreground hover:bg-accent/10'
                    )}
                    aria-pressed={mode === m.value}
                    aria-label={`Search mode: ${m.label}`}
                  >
                    {m.label}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {m.value === 'blended' && 'Semantic ranking with keyword boosting'}
                  {m.value === 'keyword' && 'Exact text and filter matching'}
                  {m.value === 'semantic' && 'Concept and paraphrase matching'}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {showSuggestions && (
          <ul
            ref={listRef}
            id="search-suggestions"
            role="listbox"
            className="absolute top-full left-0 right-0 mt-1 rounded-xl border bg-card shadow-lg py-2 z-50 max-h-64 overflow-y-auto"
          >
            {isLoadingSuggestions ? (
              <li className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading suggestions…</span>
              </li>
            ) : Object.keys(groupedSuggestions).length === 0 ? (
              <li className="px-4 py-3 text-sm text-muted-foreground">
                No suggestions
              </li>
            ) : (
              Object.entries(groupedSuggestions).map(([type, items]) => (
                <li key={type}>
                  <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {SUGGESTION_TYPE_LABELS[type] ?? type}
                  </div>
                  {items.map((item, idx) => {
                    const flatIdx = flatSuggestions.indexOf(item)
                    const isHighlighted = flatIdx === highlightedIndex
                    return (
                      <button
                        key={`${item.type}-${item.text}-${idx}`}
                        type="button"
                        data-index={flatIdx}
                        id={`suggestion-${flatIdx}`}
                        role="option"
                        aria-selected={isHighlighted}
                        className={cn(
                          'w-full text-left px-4 py-2 text-sm transition-colors',
                          isHighlighted ? 'bg-accent/10 text-accent' : 'hover:bg-accent/5'
                        )}
                        onMouseEnter={() => setHighlightedIndex(flatIdx)}
                        onClick={() => {
                          onSuggestionSelect?.(item)
                          onChange(item.text)
                          onSubmit(item.text)
                          setIsFocused(false)
                        }}
                      >
                        {renderHighlightedText(item.text, value)}
                      </button>
                    )
                  })}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </TooltipProvider>
  )
}
