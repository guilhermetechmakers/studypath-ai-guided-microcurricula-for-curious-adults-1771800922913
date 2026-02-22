# Password Reset Implementation Guide

This document describes the password reset feature and how to integrate the backend.

## Frontend Routes

- `/forgot-password` — Request reset (enter email)
- `/reset-password?token=<token>` — Set new password (from email link)

## API Endpoints (Backend)

Implement these endpoints in your backend:

### POST /auth/password-reset/request

**Request:** `{ email: string }`

**Behavior:**
- Normalize email (lowercase, trim)
- Rate limit: 5/hour per IP, 3/hour per user
- If user exists: create token, hash it, store in `password_reset_tokens`, send email
- Always return 200 with neutral message (no account enumeration)
- Return 429 on rate limit

**Response:** `{ message: string }`

### GET /auth/password-reset/validate?token=&lt;token&gt;

**Behavior:**
- Validate token (constant-time hash compare)
- Check expiry and used_at
- Return `{ valid: boolean, expiresAt?: string }`

### POST /auth/password-reset/confirm

**Request:** `{ token: string, newPassword: string }`

**Behavior:**
- Validate token
- Enforce password policy (min 12 chars, letters+digits)
- Update user password hash (Argon2id or bcrypt)
- Mark token used, invalidate other tokens for user
- Optionally create session and return `{ autoLogin: true, session: { token }, user }`
- Send "password changed" email

**Response:** `{ autoLogin: boolean, session?: { token }, user?: { id, email, name } }`

## Database

Run `database/migrations/001_password_reset_tokens.sql`. Ensure `users` table exists with `id`, `email`, `password_hash`.

## Email Templates

Templates in `templates/email/` use placeholders:
- `{{resetLink}}` — Full URL: `{APP_URL}/reset-password?token={rawToken}&email={email}`
- `{{supportLink}}` — Support/help URL

## Environment Variables

See `.env.example` for `TOKEN_TTL`, `EMAIL_*`, `RATE_LIMIT_*`, `APP_URL`.

## Deep Links (Mobile/Expo)

Handle `studypath://reset-password?token=...` to open the app and navigate to ResetPasswordPage with token param.
