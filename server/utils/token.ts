/**
 * Secure token generation for password reset.
 * Use in backend: POST /auth/password-reset/request
 *
 * Generates cryptographically secure random tokens (32 bytes, base64url).
 * Store only the hash (HMAC-SHA256 or bcrypt) in the database.
 */

import { createHmac, randomBytes } from 'crypto'

const TOKEN_BYTES = 32

/**
 * Generate a cryptographically secure random token (base64url encoded).
 * The raw token is returned only to the email; store the hash in DB.
 */
export function generateSecureToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url')
}

/**
 * Hash a token for storage. Use constant-time comparison when validating.
 */
export function hashToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex')
}

/**
 * Constant-time token comparison to prevent timing attacks.
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
