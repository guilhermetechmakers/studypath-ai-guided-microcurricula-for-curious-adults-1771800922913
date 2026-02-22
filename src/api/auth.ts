import { apiGet, apiPost } from '@/lib/api'
import type { ApiError } from '@/lib/api'

export interface PasswordResetRequestResponse {
  message: string
}

export interface PasswordResetValidateResponse {
  valid: boolean
  expiresAt?: string
}

export interface PasswordResetConfirmResponse {
  autoLogin: boolean
  session?: { token: string }
  user?: { id: string; email: string; name?: string }
}

export async function requestPasswordReset(email: string): Promise<PasswordResetRequestResponse> {
  return apiPost<PasswordResetRequestResponse>('/auth/password-reset/request', {
    email: email.toLowerCase().trim(),
  })
}

export async function validatePasswordResetToken(
  token: string
): Promise<PasswordResetValidateResponse> {
  const params = new URLSearchParams({ token })
  return apiGet<PasswordResetValidateResponse>(
    `/auth/password-reset/validate?${params.toString()}`
  )
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<PasswordResetConfirmResponse> {
  return apiPost<PasswordResetConfirmResponse>('/auth/password-reset/confirm', {
    token,
    newPassword,
  })
}

export function isRateLimitError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    (error as ApiError).status === 429
  )
}
