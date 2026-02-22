import { apiPost } from '@/lib/api'
import type { ScheduleEntry } from '@/types/curriculum'

export interface SchedulePreferences {
  session_length_minutes?: number
  availability?: { day: number; start: string; end: string }[]
  spaced_review_days?: number[]
}

export interface SuggestedSchedule {
  entries: ScheduleEntry[]
  first_sessions: ScheduleEntry[]
}

export async function getSuggestedSchedule(
  curriculumId: string,
  preferences?: SchedulePreferences
): Promise<SuggestedSchedule> {
  const body = preferences ? { schedule_preferences: preferences } : {}
  return apiPost<SuggestedSchedule>(
    `/curricula/${curriculumId}/schedule/preview`,
    body
  )
}
