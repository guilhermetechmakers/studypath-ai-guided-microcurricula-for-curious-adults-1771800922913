import {
  apiGet,
  apiPatch,
  apiPost,
  apiDelete,
  apiPostMultipart,
} from '@/lib/api'
import type {
  UserProfile,
  UserPreferences,
  OAuthConnection,
  UserSession,
  Subscription,
  Invoice,
  ExportJob,
  ImportJob,
  ImportPreview,
  UserAnalytics,
  ScheduledSession,
} from '@/types/settings'

const USERS_ME = '/users/me'

/** Profile */
export async function getUserProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>(USERS_ME)
}

export async function updateUserProfile(
  updates: Partial<Pick<UserProfile, 'name' | 'bio' | 'timezone' | 'locale'>>
): Promise<UserProfile> {
  return apiPatch<UserProfile>(USERS_ME, updates)
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const formData = new FormData()
  formData.append('avatar', file)
  return apiPostMultipart<{ avatarUrl: string }>(`${USERS_ME}/avatar`, formData)
}

/** Preferences */
export async function getUserPreferences(): Promise<UserPreferences> {
  return apiGet<UserPreferences>(`${USERS_ME}/preferences`)
}

export async function updateUserPreferences(
  updates: Partial<UserPreferences>
): Promise<UserPreferences> {
  return apiPatch<UserPreferences>(`${USERS_ME}/preferences`, updates)
}

export async function getNextSessions(): Promise<ScheduledSession[]> {
  return apiGet<ScheduledSession[]>(`${USERS_ME}/sessions/next`)
}

/** Auth / Security */
export async function changePassword(params: {
  oldPassword: string
  newPassword: string
}): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/change-password', params)
}

export async function requestEmailVerification(): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/request-email-verification', {})
}

export async function changeEmail(params: {
  newEmail: string
  password: string
}): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/change-email', params)
}

export async function getSessions(): Promise<UserSession[]> {
  return apiGet<UserSession[]>(`${USERS_ME}/sessions`)
}

export async function revokeSession(sessionId: string): Promise<void> {
  return apiDelete<void>(`${USERS_ME}/sessions/${sessionId}`)
}

/** OAuth */
export async function getOAuthConnections(): Promise<OAuthConnection[]> {
  return apiGet<OAuthConnection[]>(`${USERS_ME}/oauth`)
}

export async function connectOAuth(provider: 'google' | 'apple'): Promise<{
  redirectUrl: string
}> {
  return apiPost<{ redirectUrl: string }>(`/oauth/connect/${provider}`, {})
}

export async function disconnectOAuth(provider: 'google' | 'apple'): Promise<void> {
  return apiDelete<void>(`/oauth/${provider}`)
}

/** Subscription */
export async function getSubscription(): Promise<Subscription | null> {
  return apiGet<Subscription | null>('/subscription')
}

export async function createSubscription(params: {
  planId: string
  coupon?: string
}): Promise<Subscription> {
  return apiPost<Subscription>('/subscription/create', params)
}

export async function cancelSubscription(): Promise<Subscription> {
  return apiPost<Subscription>('/subscription/cancel', {})
}

export async function updatePaymentMethod(token: string): Promise<void> {
  return apiPost<void>('/payments/method', { token })
}

export async function getInvoices(): Promise<Invoice[]> {
  return apiGet<Invoice[]>('/invoices')
}

export async function getInvoiceDownloadUrl(id: string): Promise<{ url: string }> {
  return apiGet<{ url: string }>(`/invoices/${id}/download`)
}

/** Export */
export async function createExport(params: {
  items: { type: string; id: string }[]
  format: 'pdf' | 'markdown' | 'csv'
  emailWhenReady?: boolean
}): Promise<ExportJob> {
  return apiPost<ExportJob>('/exports', params)
}

export async function getExport(id: string): Promise<ExportJob> {
  return apiGet<ExportJob>(`/exports/${id}`)
}

/** Import */
export async function createImport(file: File): Promise<ImportJob> {
  const formData = new FormData()
  formData.append('file', file)
  return apiPostMultipart<ImportJob>('/imports', formData)
}

export async function getImport(id: string): Promise<ImportJob> {
  return apiGet<ImportJob>(`/imports/${id}`)
}

export async function getImportPreview(id: string): Promise<ImportPreview> {
  return apiGet<ImportPreview>(`/imports/${id}/preview`)
}

export async function commitImport(
  id: string,
  mappings: Record<string, string>
): Promise<ImportJob> {
  return apiPost<ImportJob>(`/imports/${id}/commit`, { mappings })
}

/** Analytics */
export async function getUserAnalytics(params?: {
  range?: '7d' | '30d' | '90d'
  curriculumId?: string
}): Promise<UserAnalytics> {
  const search = params
    ? '?' + new URLSearchParams(params as Record<string, string>).toString()
    : ''
  return apiGet<UserAnalytics>(`/analytics/user${search}`)
}

/** Account deletion */
export async function deleteAccount(params: {
  confirmName: string
  password: string
}): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/account/delete', params)
}
