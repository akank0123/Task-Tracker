import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import * as api from './api/tasks'

vi.mock('./api/tasks', async () => {
  const actual = await vi.importActual('./api/tasks')
  return {
    ...actual,
    listTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  }
})

function makeTask(overrides = {}) {
  return {
    id: 1,
    title: 'Sample task',
    description: null,
    priority: 'medium',
    status: 'open',
    due_date: null,
    needs_attention: false,
    attention_reason: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const mockedApi = vi.mocked(api)

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads and displays open tasks along with the attention count', async () => {
    const overdueTask = makeTask({ id: 1, title: 'Overdue task', needs_attention: true, attention_reason: 'overdue' })
    const safeTask = makeTask({ id: 2, title: 'Safe task' })

    mockedApi.listTasks.mockImplementation(async (filter) => {
      if (filter?.needsAttention) return [overdueTask]
      return [overdueTask, safeTask]
    })

    render(<App />)

    expect(await screen.findByText('Overdue task')).toBeInTheDocument()
    expect(screen.getByText('Safe task')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // attention count badge
  })

  it('re-fetches with the needs_attention filter when that tab is selected', async () => {
    const overdueTask = makeTask({ id: 1, title: 'Overdue task', needs_attention: true, attention_reason: 'overdue' })
    const safeTask = makeTask({ id: 2, title: 'Safe task' })

    mockedApi.listTasks.mockImplementation(async (filter) => {
      if (filter?.needsAttention) return [overdueTask]
      return [overdueTask, safeTask]
    })

    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Safe task')

    await user.click(screen.getByRole('tab', { name: /needs attention/i }))

    await waitFor(() => expect(screen.queryByText('Safe task')).not.toBeInTheDocument())
    expect(screen.getByText('Overdue task')).toBeInTheDocument()
  })

  it('creates a task through the form and refreshes the list', async () => {
    const newTask = makeTask({ id: 5, title: 'Brand new task' })
    mockedApi.listTasks.mockResolvedValueOnce([]).mockResolvedValueOnce([])
    mockedApi.createTask.mockResolvedValue(newTask)

    const user = userEvent.setup()
    render(<App />)
    await waitFor(() => expect(mockedApi.listTasks).toHaveBeenCalled())

    mockedApi.listTasks.mockResolvedValue([newTask])

    await user.type(screen.getByLabelText('Title'), 'Brand new task')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    await screen.findByText('Brand new task')
    expect(mockedApi.createTask).toHaveBeenCalledWith(expect.objectContaining({ title: 'Brand new task' }))
  })

  it('deletes a task when its delete button is clicked', async () => {
    const task = makeTask({ id: 9, title: 'Doomed task' })
    mockedApi.listTasks.mockResolvedValue([task])
    mockedApi.deleteTask.mockResolvedValue(undefined)

    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Doomed task')

    mockedApi.listTasks.mockResolvedValue([])

    const item = screen.getByText('Doomed task').closest('li')
    await user.click(within(item).getByRole('button', { name: 'Delete' }))

    expect(mockedApi.deleteTask).toHaveBeenCalledWith(9)
  })
})
