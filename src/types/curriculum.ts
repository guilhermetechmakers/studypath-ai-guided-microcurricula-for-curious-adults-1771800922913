export interface Citation {
  id: string
  text: string
  source?: string
  url?: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
}

export interface GoDeeperSection {
  id: string
  title: string
  content: string
}

export interface MicroCheck {
  id: string
  question: string
  type: 'multiple_choice' | 'short_answer'
  options?: string[]
}

export interface ImageRequest {
  id: string
  request_prompt: string
  requestPrompt?: string
  style: 'map' | 'diagram' | 'photo' | 'schematic'
  alt_text?: string
  altText?: string
  asset_url?: string
  thumbnail_url?: string
  width?: number
  height?: number
  provider_license?: string
  license_url?: string
}

export interface Lesson {
  id: string
  title: string
  content: string
  body?: string
  objectives?: string[]
  estimatedMinutes: number
  imagePrompt?: string
  imageUrl?: string
  imageRequests?: ImageRequest[]
  citations?: Citation[]
  goDeeper?: string
  goDeep?: GoDeeperSection[]
  go_deep?: GoDeeperSection[]
  microChecks?: MicroCheck[]
  micro_checks?: MicroCheck[]
  quiz?: QuizQuestion[]
  tags?: string[]
  order_index?: number
}

export interface Chapter {
  id: string
  title: string
  summary?: string
  lessons: Lesson[]
  order: number
  order_index?: number
  estimated_minutes?: number
  estimatedMinutes?: number
}

export interface Curriculum {
  id: string
  title: string
  description?: string
  prompt_text?: string
  parameters?: CurriculumParameters
  chapters: Chapter[]
  totalEstimatedMinutes: number
  total_estimated_minutes?: number
  createdAt: string
  updatedAt: string
  userId?: string
  user_id?: string
  isPublic?: boolean
  tags?: string[]
  status?: 'draft' | 'generated' | 'adopted'
}

export interface CurriculumParameters {
  session_length_minutes?: number
  duration_weeks?: number
  depth?: number
  focus_tags?: string[]
  prior_knowledge?: 'none' | 'beginner' | 'intermediate' | 'advanced'
  advanced_options?: AdvancedOptions
}

export interface AdvancedOptions {
  citation_style?: 'apa' | 'chicago' | 'links_only'
  image_style?: ('map' | 'diagram' | 'photo' | 'schematic')[]
  image_license?: 'open-license' | 'stock-licensed'
  language_register?: 'plain' | 'technical'
  include_assessments?: boolean
}

export interface CurriculumPreview {
  id: string
  title: string
  description?: string
  chapterCount: number
  lessonCount: number
  totalEstimatedMinutes: number
  tags?: string[]
}

export interface GenerationJob {
  id: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  progress_messages?: string[]
  curriculum_id?: string
  started_at?: string
  finished_at?: string
  error?: string
}

export interface ScheduleEntry {
  id: string
  lesson_id: string
  scheduled_at: string
  duration_minutes: number
  type: 'lesson' | 'review'
  completed_at?: string
}

export interface GenerationParams {
  session_length_minutes?: number
  duration_weeks?: number
  depth?: number
  focus_tags?: string[]
  prior_knowledge?: 'none' | 'beginner' | 'intermediate' | 'advanced'
  advanced_options?: AdvancedOptions
}

export interface GenerationRequest {
  prompt: string
  params?: GenerationParams
  context?: {
    recent_notes?: string
    active_lesson_id?: string
  }
}

export interface GenerationJobResponse {
  job_id: string
  websocket_url?: string
  sse_url?: string
}
