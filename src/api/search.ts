import { apiGet } from '@/lib/api'

export interface SearchParams {
  q: string
  filters?: Record<string, string | string[]>
  page?: number
  perPage?: number
}

export interface SearchResult {
  id: string
  type: 'curriculum' | 'lesson'
  title: string
  snippet?: string
  metadata?: Record<string, unknown>
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  page: number
}

export async function search(params: SearchParams): Promise<SearchResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set('q', params.q)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.perPage) searchParams.set('per_page', String(params.perPage))
  if (params.filters) {
    Object.entries(params.filters).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((val) => searchParams.append(`filter[${k}]`, val))
      else searchParams.set(`filter[${k}]`, v)
    })
  }
  return apiGet<SearchResponse>(`/search?${searchParams.toString()}`)
}
