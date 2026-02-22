const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export function getApiBase(): string {
  return API_BASE as string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = {
      message: response.statusText,
      status: response.status,
    }
    try {
      const data = await response.json()
      error.message = data.message ?? data.error ?? response.statusText
      error.code = data.code
    } catch {
      // Use default message
    }
    throw error
  }

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return response.json()
  }
  return response.text() as unknown as T
}

export async function apiGet<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    ...options,
    headers,
  })
  return handleResponse<T>(response)
}

export async function apiPost<T>(
  path: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    ...options,
    headers,
  })
  return handleResponse<T>(response)
}

export async function apiPut<T>(
  path: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
    ...options,
    headers,
  })
  return handleResponse<T>(response)
}

export async function apiPatch<T>(
  path: string,
  body?: unknown,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options?.headers,
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
    ...options,
    headers,
  })
  return handleResponse<T>(response)
}

export async function apiDelete<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const headers: HeadersInit = {
    ...options?.headers,
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    ...options,
    headers,
  })
  return handleResponse<T>(response)
}

/** Multipart form data (e.g. avatar upload). Do not set Content-Type; browser sets it with boundary. */
export async function apiPostMultipart<T>(
  path: string,
  formData: FormData,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('auth_token')
  const headers: HeadersInit = {
    ...options?.headers,
  }
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }
  delete (headers as Record<string, string>)['Content-Type']

  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    body: formData,
    ...options,
    headers,
  })
  return handleResponse<T>(response)
}
