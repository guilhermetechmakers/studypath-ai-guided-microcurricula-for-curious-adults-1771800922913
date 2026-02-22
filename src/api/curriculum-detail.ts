import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api'
import type {
  Curriculum,
  Lesson,
  Chapter,
  CurriculumVersion,
  ReorderPayload,
  ExportJob,
  ImportPreview,
} from '@/types/curriculum'

export async function getCurriculumDetail(id: string): Promise<Curriculum> {
  return apiGet<Curriculum>(`/curricula/${id}`)
}

export async function updateCurriculumDetail(
  id: string,
  updates: Partial<Pick<Curriculum, 'title' | 'description' | 'tags' | 'status'>>
): Promise<Curriculum> {
  return apiPatch<Curriculum>(`/curricula/${id}`, updates)
}

export async function duplicateCurriculum(id: string): Promise<Curriculum> {
  return apiPost<Curriculum>(`/curricula/${id}/duplicate`, {})
}

export async function createChapter(curriculumId: string, title: string): Promise<Chapter> {
  return apiPost<Chapter>(`/curricula/${curriculumId}/chapters`, { title })
}

export async function updateChapter(
  chapterId: string,
  updates: Partial<Pick<Chapter, 'title' | 'order'>>
): Promise<Chapter> {
  return apiPatch<Chapter>(`/chapters/${chapterId}`, updates)
}

export async function deleteChapter(chapterId: string): Promise<void> {
  return apiDelete(`/chapters/${chapterId}`)
}

export async function reorderCurriculum(
  curriculumId: string,
  payload: ReorderPayload
): Promise<Curriculum> {
  return apiPatch<Curriculum>(`/curricula/${curriculumId}/reorder`, payload)
}

export async function getCurriculumVersions(curriculumId: string): Promise<CurriculumVersion[]> {
  return apiGet<CurriculumVersion[]>(`/curricula/${curriculumId}/versions`)
}

export async function revertCurriculumVersion(
  curriculumId: string,
  versionId: string
): Promise<Curriculum> {
  return apiPost<Curriculum>(`/curricula/${curriculumId}/versions/${versionId}/revert`, {})
}

export async function getLesson(lessonId: string): Promise<Lesson> {
  return apiGet<Lesson>(`/lessons/${lessonId}`)
}

export async function updateLesson(
  lessonId: string,
  updates: Partial<Pick<Lesson, 'title' | 'summary' | 'body' | 'bodyBlocks' | 'estimatedMinutes' | 'difficulty' | 'tags' | 'citations'>>
): Promise<Lesson> {
  return apiPatch<Lesson>(`/lessons/${lessonId}`, updates)
}

export async function deleteLesson(lessonId: string): Promise<void> {
  return apiDelete(`/lessons/${lessonId}`)
}

export async function createLesson(
  chapterId: string,
  curriculumId: string,
  data: Partial<Lesson>
): Promise<Lesson> {
  return apiPost<Lesson>(`/curricula/${curriculumId}/chapters/${chapterId}/lessons`, data)
}

export async function startExport(
  curriculumId: string,
  options: { format: 'pdf' | 'markdown' | 'csv' | 'zip'; includeNotes?: boolean; includeProgress?: boolean }
): Promise<ExportJob> {
  return apiPost<ExportJob>(`/curricula/${curriculumId}/export`, options)
}

export async function getExportJobStatus(jobId: string): Promise<ExportJob> {
  return apiGet<ExportJob>(`/export/jobs/${jobId}/status`)
}

export async function importCurriculum(
  file: File,
  options: { mergeOption: 'replace' | 'append' | 'create_new'; targetCurriculumId?: string }
): Promise<Curriculum | ImportPreview> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('merge_option', options.mergeOption)
  if (options.targetCurriculumId) {
    formData.append('target_curriculum_id', options.targetCurriculumId)
  }
  const token = localStorage.getItem('auth_token')
  const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
  const response = await fetch(`${API_BASE}/curricula/import`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message ?? response.statusText)
  }
  return response.json()
}
