import { useQuery } from '@tanstack/react-query'
import { getAutosuggest } from '@/api/search-curricula'
import type { AutosuggestItem } from '@/types/search'

const QUERY_KEY = ['search', 'autosuggest'] as const

export function useAutosuggest(q: string, limit = 10) {
  return useQuery({
    queryKey: [...QUERY_KEY, q, limit],
    queryFn: () => getAutosuggest(q, limit),
    enabled: q.trim().length >= 2,
    staleTime: 60_000,
  })
}

export type { AutosuggestItem }
