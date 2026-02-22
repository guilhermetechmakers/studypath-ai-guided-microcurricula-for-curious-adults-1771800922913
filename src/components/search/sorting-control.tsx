import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { SortOption } from '@/types/search'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'most_adopted', label: 'Most Adopted' },
]

export interface SortingControlProps {
  value: SortOption
  onChange: (value: SortOption) => void
  className?: string
  'aria-label'?: string
}

export function SortingControl({
  value,
  onChange,
  className,
  'aria-label': ariaLabel = 'Sort results',
}: SortingControlProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortOption)}>
      <SelectTrigger
        className={cn('w-[180px]', className)}
        aria-label={ariaLabel}
      >
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
