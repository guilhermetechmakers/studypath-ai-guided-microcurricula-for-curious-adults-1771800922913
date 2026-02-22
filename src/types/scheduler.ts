/** Notification preferences from GET /api/v1/notifications/preferences */
export interface NotificationCategories {
  session_reminder: boolean
  milestone: boolean
  suggestion: boolean
}

export interface NotificationPreferences {
  user_id: string
  push_enabled: boolean
  email_enabled: boolean
  in_app_enabled: boolean
  categories: NotificationCategories
  default_reminder_minutes: number
  updated_at: string
  /** Optional: device push permission status from client */
  push_token_status?: 'granted' | 'denied' | 'default'
}

/** Weekly availability - day 0=Sun, 6=Sat */
export interface TimeRange {
  start: string // HH:MM
  end: string
}

export interface DayAvailability {
  [dayOfWeek: number]: TimeRange[]
}

export interface WeeklyAvailability {
  availability: DayAvailability
  granularity_minutes: number
  default_session_minutes: number
  preferred_times: {
    morning: boolean
    afternoon: boolean
    evening: boolean
  }
  updated_at?: string
}

/** Session status and source */
export type SessionStatus = 'scheduled' | 'completed' | 'canceled' | 'skipped'
export type SessionSource = 'user' | 'ai'

/** Scheduled study session */
export interface Session {
  id: string
  user_id: string
  curriculum_id?: string
  lesson_id?: string
  curriculum_title?: string
  lesson_title?: string
  scheduled_at: string // ISO8601 UTC
  duration_minutes: number
  reminder_lead_minutes: number
  status: SessionStatus
  source: SessionSource
  created_at: string
  updated_at: string
}

/** Create session payload */
export interface CreateSessionPayload {
  idempotency_key?: string
  curriculum_id?: string
  lesson_id?: string
  curriculum_title?: string
  lesson_title?: string
  scheduled_at: string
  duration_minutes: number
  reminder_lead_minutes?: number
  source?: SessionSource
}

/** AI schedule suggestion item */
export interface ScheduleSuggestion {
  suggested_at: string // ISO8601 UTC
  duration_minutes: number
  reason_text?: string
  curriculum_id?: string
  lesson_id?: string
  curriculum_title?: string
  lesson_title?: string
  repeat_rule?: string
  dependency?: string
}

export interface ScheduleSuggestionsResponse {
  suggestions: ScheduleSuggestion[]
  rationale?: {
    spaced_review?: string[]
    milestones?: string[]
  }
}

/** Notification log entry */
export type NotificationType = 'push' | 'email' | 'in_app'
export type NotificationCategory = 'session_reminder' | 'milestone' | 'suggestion'
export type NotificationLogStatus = 'queued' | 'sent' | 'delivered' | 'opened' | 'failed'

export interface NotificationLog {
  id: string
  user_id: string
  session_id?: string
  type: NotificationType
  category: NotificationCategory
  status: NotificationLogStatus
  provider_id?: string
  payload?: Record<string, unknown>
  timestamp: string
}

/** Availability matrix - block-based (hourly default) */
export interface AvailabilityBlock {
  dayOfWeek: number // 0-6
  hour: number // 0-23
  available: boolean
}
