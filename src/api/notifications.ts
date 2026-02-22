import { apiGet, apiPut, apiPost } from '@/lib/api'
import type {
  NotificationPreferences,
  NotificationCategories,
  NotificationLog,
} from '@/types/scheduler'

const BASE = '/v1/notifications'

/** GET /api/v1/notifications/preferences */
export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiGet<NotificationPreferences>(`${BASE}/preferences`)
}

/** PUT /api/v1/notifications/preferences */
export async function updateNotificationPreferences(
  updates: Partial<{
    push_enabled: boolean
    email_enabled: boolean
    in_app_enabled: boolean
    categories: NotificationCategories
    default_reminder_minutes: number
  }>
): Promise<NotificationPreferences> {
  return apiPut<NotificationPreferences>(`${BASE}/preferences`, updates)
}

/** GET /api/v1/notifications/history */
export async function getNotificationHistory(params?: {
  days?: number
}): Promise<NotificationLog[]> {
  const search = params?.days ? `?days=${params.days}` : ''
  return apiGet<NotificationLog[]>(`${BASE}/history${search}`)
}
