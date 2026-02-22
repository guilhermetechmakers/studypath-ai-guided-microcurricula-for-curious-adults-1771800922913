import { apiGet, apiPut, apiPost } from '@/lib/api'
import type {
  WeeklyAvailability,
  Session,
  ScheduleSuggestionsResponse,
  CreateSessionPayload,
} from '@/types/scheduler'

const BASE = '/v1/scheduler'

/** GET /api/v1/scheduler/availability */
export async function getAvailability(): Promise<WeeklyAvailability> {
  return apiGet<WeeklyAvailability>(`${BASE}/availability`)
}

/** PUT /api/v1/scheduler/availability */
export async function updateAvailability(
  payload: Partial<WeeklyAvailability>
): Promise<WeeklyAvailability> {
  return apiPut<WeeklyAvailability>(`${BASE}/availability`, payload)
}

/** POST /api/v1/scheduler/suggestions */
export async function getScheduleSuggestions(params?: {
  horizon_days?: number
}): Promise<ScheduleSuggestionsResponse> {
  return apiPost<ScheduleSuggestionsResponse>(`${BASE}/suggestions`, params ?? {})
}

/** POST /api/v1/scheduler/sessions - idempotent create */
export async function createSessions(params: {
  sessions: CreateSessionPayload[]
  idempotency_key?: string
}): Promise<Session[]> {
  return apiPost<Session[]>(`${BASE}/sessions`, params)
}

/** GET /api/v1/scheduler/sessions */
export async function getSessions(params?: {
  from?: string
  to?: string
  limit?: number
}): Promise<Session[]> {
  const searchParams = new URLSearchParams()
  if (params?.from) searchParams.set('from', params.from)
  if (params?.to) searchParams.set('to', params.to)
  if (params?.limit) searchParams.set('limit', String(params.limit))
  const qs = searchParams.toString() ? `?${searchParams.toString()}` : ''
  return apiGet<Session[]>(`${BASE}/sessions${qs}`)
}

/** PUT /api/v1/scheduler/sessions/:id */
export async function updateSession(
  id: string,
  updates: Partial<{
    scheduled_at: string
    duration_minutes: number
    reminder_lead_minutes: number
    status: string
  }>
): Promise<Session> {
  return apiPut<Session>(`${BASE}/sessions/${id}`, updates)
}

/** POST /api/v1/scheduler/sessions/:id/cancel */
export async function cancelSession(
  id: string,
  params?: { reason?: string }
): Promise<Session> {
  return apiPost<Session>(`${BASE}/sessions/${id}/cancel`, params ?? {})
}
