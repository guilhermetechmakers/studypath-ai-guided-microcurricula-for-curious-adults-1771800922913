import { apiGet, apiPost, apiPatch } from '@/lib/api'
import type {
  Curriculum,
  GenerationRequest,
  GenerationJobResponse,
} from '@/types/curriculum'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function generateCurriculum(
  request: GenerationRequest
): Promise<GenerationJobResponse> {
  return apiPost<GenerationJobResponse>(`/curricula/generate`, request)
}

export async function getCurriculum(id: string): Promise<Curriculum> {
  return apiGet<Curriculum>(`/curricula/${id}`)
}

export async function saveCurriculum(
  curriculum: Curriculum
): Promise<Curriculum> {
  return apiPost<Curriculum>(`/curricula`, curriculum)
}

export async function updateCurriculum(
  id: string,
  updates: Partial<Curriculum>
): Promise<Curriculum> {
  return apiPatch<Curriculum>(`/curricula/${id}`, updates)
}

export async function adoptCurriculum(
  curriculumId: string,
  schedulePreferences?: Record<string, unknown>
): Promise<{ curriculumId: string; scheduleEntries: ScheduleEntry[] }> {
  return apiPost<{ curriculumId: string; scheduleEntries: ScheduleEntry[] }>(
    `/curricula/${curriculumId}/adopt`,
    { schedule_preferences: schedulePreferences }
  )
}

export function getStreamUrl(jobId: string): string {
  const base =
    typeof API_BASE === 'string' && API_BASE.startsWith('http')
      ? API_BASE.replace(/\/$/, '')
      : `${window.location.origin}${(API_BASE as string).replace(/\/$/, '') || ''}`
  return `${base}/curricula/generate/${jobId}/stream`
}

export interface ScheduleEntry {
  id: string
  lesson_id: string
  scheduled_at: string
  duration_minutes: number
  type: 'lesson' | 'review'
  completed_at?: string
}
