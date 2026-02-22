import { apiPost } from '@/lib/api'

export interface RewriteRequest {
  rewriteType: 'simpler' | 'more_technical' | 'alternate_example'
  userPrompt?: string
}

export interface RewriteResponse {
  body: string
  objectives?: string[]
}

export async function rewriteLesson(
  lessonId: string,
  request: RewriteRequest
): Promise<RewriteResponse> {
  return apiPost<RewriteResponse>(`/lessons/${lessonId}/rewrite`, request)
}

export interface QnaRequest {
  question: string
}

export interface QnaResponse {
  answer: string
}

export async function lessonQna(
  lessonId: string,
  request: QnaRequest
): Promise<QnaResponse> {
  return apiPost<QnaResponse>(`/lessons/${lessonId}/qna`, request)
}
