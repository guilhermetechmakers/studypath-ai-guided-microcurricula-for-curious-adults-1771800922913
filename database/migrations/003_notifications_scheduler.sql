-- Notifications & Scheduler - Database Schema
-- Supports weekly availability, session scheduling, notification preferences, and history.
-- Prerequisites: users table must exist.

-- Notification preferences per user
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  categories JSONB NOT NULL DEFAULT '{"session_reminder": true, "milestone": true, "suggestion": true}'::jsonb,
  default_reminder_minutes INT NOT NULL DEFAULT 30,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Weekly availability (Option B: blob per user)
CREATE TABLE IF NOT EXISTS weekly_availability (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  availability JSONB NOT NULL DEFAULT '{}'::jsonb,
  granularity_minutes INT NOT NULL DEFAULT 60,
  default_session_minutes INT NOT NULL DEFAULT 30,
  preferred_times JSONB DEFAULT '{"morning": false, "afternoon": false, "evening": false}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scheduled study sessions
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'canceled', 'skipped');
CREATE TYPE session_source AS ENUM ('user', 'ai');

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  curriculum_id UUID REFERENCES curricula(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  curriculum_title VARCHAR(512),
  lesson_title VARCHAR(512),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes >= 5 AND duration_minutes <= 240),
  reminder_lead_minutes INT NOT NULL DEFAULT 30,
  status session_status NOT NULL DEFAULT 'scheduled',
  source session_source NOT NULL DEFAULT 'user',
  idempotency_key VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_user_scheduled ON sessions(user_id, scheduled_at);

-- Notification delivery logs
CREATE TYPE notification_type AS ENUM ('push', 'email', 'in_app');
CREATE TYPE notification_category AS ENUM ('session_reminder', 'milestone', 'suggestion');
CREATE TYPE notification_status AS ENUM ('queued', 'sent', 'delivered', 'opened', 'failed');

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  type notification_type NOT NULL,
  category notification_category NOT NULL,
  status notification_status NOT NULL DEFAULT 'queued',
  provider_id VARCHAR(255),
  payload JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_logs_user ON notification_logs(user_id);
CREATE INDEX idx_notification_logs_timestamp ON notification_logs(timestamp);
CREATE INDEX idx_notification_logs_session ON notification_logs(session_id);

-- AI schedule suggestions cache
CREATE TABLE IF NOT EXISTS schedule_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  rationale JSONB,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted BOOLEAN NOT NULL DEFAULT false,
  accepted_at TIMESTAMPTZ
);

CREATE INDEX idx_schedule_suggestions_user ON schedule_suggestions(user_id);
CREATE INDEX idx_schedule_suggestions_generated ON schedule_suggestions(generated_at);
