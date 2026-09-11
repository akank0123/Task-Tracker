/**
 * @typedef {'low' | 'medium' | 'high'} Priority
 * @typedef {'open' | 'completed'} Status
 * @typedef {'overdue' | 'due_soon' | 'high_priority_upcoming' | null} AttentionReason
 *
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {string | null} description
 * @property {Priority} priority
 * @property {Status} status
 * @property {string | null} due_date
 * @property {boolean} needs_attention
 * @property {AttentionReason} attention_reason
 * @property {string} created_at
 * @property {string} updated_at
 *
 * @typedef {Object} NewTaskInput
 * @property {string} title
 * @property {string} [description]
 * @property {Priority} [priority]
 * @property {string | null} [due_date]
 *
 * @typedef {Object} UpdateTaskInput
 * @property {string} [title]
 * @property {string | null} [description]
 * @property {Priority} [priority]
 * @property {Status} [status]
 * @property {string | null} [due_date]
 */

export class ApiError extends Error {
  constructor(message, status, fieldErrors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (response.status === 204) {
    return undefined
  }

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(
      body?.message ?? `Request failed with status ${response.status}`,
      response.status,
      body?.errors ?? {}
    )
  }

  return body
}

/**
 * @param {{ needsAttention?: boolean, status?: Status }} [filter]
 * @returns {Promise<Task[]>}
 */
export function listTasks(filter = {}) {
  const params = new URLSearchParams()
  if (filter.needsAttention) params.set('needs_attention', '1')
  if (filter.status) params.set('status', filter.status)
  const query = params.toString()

  return request(`/tasks${query ? `?${query}` : ''}`).then((res) => res.data)
}

/**
 * @param {NewTaskInput} input
 * @returns {Promise<Task>}
 */
export function createTask(input) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  }).then((res) => res.data)
}

/**
 * @param {number} id
 * @param {UpdateTaskInput} input
 * @returns {Promise<Task>}
 */
export function updateTask(id, input) {
  return request(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  }).then((res) => res.data)
}

/**
 * @param {number} id
 * @returns {Promise<void>}
 */
export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: 'DELETE' })
}
