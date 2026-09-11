export type Priority = 'low' | 'medium' | 'high'
export type Status = 'open' | 'completed'
export type AttentionReason = 'overdue' | 'due_soon' | 'high_priority_upcoming' | null

export interface Task {
  id: number
  title: string
  description: string | null
  priority: Priority
  status: Status
  due_date: string | null
  needs_attention: boolean
  attention_reason: AttentionReason
  created_at: string
  updated_at: string
}

export interface NewTaskInput {
  title: string
  description?: string
  priority?: Priority
  due_date?: string | null
}

export interface UpdateTaskInput {
  title?: string
  description?: string | null
  priority?: Priority
  status?: Status
  due_date?: string | null
}

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string[]>

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (response.status === 204) {
    return undefined as T
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      body?.message ?? `Request failed with status ${response.status}`,
      response.status,
      body?.errors ?? {}
    )
  }

  return body as T
}

export function listTasks(filter: { needsAttention?: boolean; status?: Status } = {}) {
  const params = new URLSearchParams()
  if (filter.needsAttention) params.set('needs_attention', '1')
  if (filter.status) params.set('status', filter.status)
  const query = params.toString()

  return request<{ data: Task[] }>(`/tasks${query ? `?${query}` : ''}`).then((res) => res.data)
}

export function createTask(input: NewTaskInput) {
  return request<{ data: Task }>('/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  }).then((res) => res.data)
}

export function updateTask(id: number, input: UpdateTaskInput) {
  return request<{ data: Task }>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  }).then((res) => res.data)
}

export function deleteTask(id: number) {
  return request<void>(`/tasks/${id}`, { method: 'DELETE' })
}
