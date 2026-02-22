/**
 * Client-side password strength estimator using heuristics.
 * Falls back to server-side validation for final policy enforcement.
 */

export type PasswordStrength = 'weak' | 'ok' | 'strong'

export interface PasswordStrengthResult {
  score: number
  label: PasswordStrength
  meetsMinLength: boolean
  hasLetter: boolean
  hasDigit: boolean
  hasSpecial: boolean
}

const MIN_LENGTH = 12

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const meetsMinLength = password.length >= MIN_LENGTH
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)

  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (hasLetter) score += 1
  if (hasDigit) score += 1
  if (hasSpecial) score += 1
  if (hasLetter && /[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1

  const label: PasswordStrength =
    score >= 5 ? 'strong' : score >= 3 ? 'ok' : 'weak'

  return {
    score: Math.min(score, 7),
    label,
    meetsMinLength,
    hasLetter,
    hasDigit,
    hasSpecial,
  }
}

export function meetsPasswordPolicy(password: string): boolean {
  const result = calculatePasswordStrength(password)
  return (
    result.meetsMinLength &&
    (result.hasLetter || result.hasDigit) &&
    result.label !== 'weak'
  )
}

export const PASSWORD_MIN_LENGTH = MIN_LENGTH
