import { apiPost } from '@/lib/api'

export interface ImageRequest {
  lessonId: string
  prompt: string
  style: 'map' | 'diagram' | 'photo' | 'schematic'
  count?: number
}

export interface ImageAsset {
  id: string
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  license?: string
  licenseUrl?: string
  altText?: string
}

export interface GenerateImagesRequest {
  imageRequests: ImageRequest[]
  licensePreference?: 'open-license' | 'stock-licensed'
}

export interface GenerateImagesResponse {
  assets: ImageAsset[]
}

export async function generateImages(
  request: GenerateImagesRequest
): Promise<GenerateImagesResponse> {
  return apiPost<GenerateImagesResponse>(`/images/generate`, request)
}
