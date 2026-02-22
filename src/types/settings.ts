/** User profile from GET /api/users/me */
export interface UserProfile {
  id: string
  email: string
  emailVerified: boolean
  name?: string
  bio?: string
  avatarUrl?: string
  timezone?: string
  locale?: string
  subscriptionId?: string
  roles?: string[]
  createdAt: string
}

/** User preferences from GET /api/users/me/preferences */
export type LearningDepth = 'overview' | 'detailed' | 'expert'
export type CitationStyle = 'apa' | 'mla' | 'chicago' | 'none'
export type StudyCadence = 'daily' | 'weekly'

export interface UserPreferences {
  sessionLengthMinutes: 15 | 25 | 45 | 60
  learningDepth: LearningDepth
  citationStyle: CitationStyle
  studyCadence: StudyCadence
  preferredTimes?: { start: string; end: string }[]
  priorKnowledgeLevel: number
  spacedReviewEnabled: boolean
  spacedReviewSettings?: Record<string, unknown>
  emailNotifications?: boolean
}

/** OAuth connection from connected accounts */
export interface OAuthConnection {
  id: string
  provider: 'google' | 'apple'
  providerUserId: string
  connectedAt: string
}

/** Session/device from session management */
export interface UserSession {
  id: string
  device?: string
  lastActive?: string
  current?: boolean
}

/** Subscription from GET /api/subscription */
export type PlanId = 'free' | 'pro' | 'team'

export interface Subscription {
  id: string
  planId: PlanId
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodEnd: string
  cancelAtPeriodEnd?: boolean
}

/** Invoice from GET /api/invoices */
export interface Invoice {
  id: string
  stripeInvoiceId: string
  amount: number
  currency: string
  pdfUrl?: string
  createdAt: string
}

/** Export job from POST /api/exports */
export type ExportFormat = 'pdf' | 'markdown' | 'csv'
export type ExportType = 'curriculum' | 'notes' | 'analytics'

export interface ExportJob {
  id: string
  type: ExportType
  format: ExportFormat
  status: 'pending' | 'processing' | 'completed' | 'failed'
  fileUrl?: string
  errorMessage?: string
  createdAt: string
  completedAt?: string
}

/** Import job from POST /api/imports */
export interface ImportPreview {
  items: { title: string; level?: number }[]
  conflicts?: { title: string; existingId?: string }[]
}

export interface ImportJob {
  id: string
  status: 'pending' | 'parsing' | 'ready' | 'completed' | 'failed'
  parsedPreview?: ImportPreview
  errorMessage?: string
  createdAt: string
  completedAt?: string
}

/** Analytics from GET /api/analytics/user */
export interface UserAnalytics {
  lessonsCompleted: number
  minutesStudied: number
  streakDays: number
  milestonesReached: number
  byPeriod: {
    '7d'?: { lessonsCompleted: number; minutesStudied: number }
    '30d'?: { lessonsCompleted: number; minutesStudied: number }
    '90d'?: { lessonsCompleted: number; minutesStudied: number }
  }
}

/** Scheduled session suggestion */
export interface ScheduledSession {
  id: string
  curriculumId: string
  curriculumTitle: string
  lessonId: string
  lessonTitle: string
  scheduledTime: string
  durationMinutes: number
  status: 'scheduled' | 'completed' | 'skipped'
}
