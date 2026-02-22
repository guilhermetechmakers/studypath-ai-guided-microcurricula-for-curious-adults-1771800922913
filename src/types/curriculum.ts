export interface Lesson {
  id: string
  title: string
  content: string
  estimatedMinutes: number
  imagePrompt?: string
  imageUrl?: string
  citations?: Citation[]
  goDeeper?: string
  quiz?: QuizQuestion[]
}

export interface Citation {
  id: string
  text: string
  source: string
  url?: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
}

export interface Chapter {
  id: string
  title: string
  lessons: Lesson[]
  order: number
}

export interface Curriculum {
  id: string
  title: string
  description?: string
  chapters: Chapter[]
  totalEstimatedMinutes: number
  createdAt: string
  updatedAt: string
  userId?: string
  isPublic?: boolean
  tags?: string[]
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
