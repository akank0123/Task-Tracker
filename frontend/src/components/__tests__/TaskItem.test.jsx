import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskItem } from '../TaskItem'

function makeTask(overrides = {}) {
  return {
    id: 1,
    title: 'Write tests',
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

describe('TaskItem', () => {
  it('shows an attention badge when the task needs attention', () => {
    const task = makeTask({ needs_attention: true, attention_reason: 'overdue' })

    render(<TaskItem task={task} onToggleStatus={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.getByText('Overdue')).toBeInTheDocument()
  })

  it('does not show an attention badge when the task does not need attention', () => {
    const task = makeTask({ needs_attention: false, attention_reason: null })

    render(<TaskItem task={task} onToggleStatus={vi.fn()} onDelete={vi.fn()} />)

    expect(screen.queryByText('Overdue')).not.toBeInTheDocument()
    expect(screen.queryByText('Due soon')).not.toBeInTheDocument()
  })

  it('offers "Mark complete" for open tasks and "Reopen" for completed ones', () => {
    const { rerender } = render(
      <TaskItem task={makeTask({ status: 'open' })} onToggleStatus={vi.fn()} onDelete={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: 'Mark complete' })).toBeInTheDocument()

    rerender(<TaskItem task={makeTask({ status: 'completed' })} onToggleStatus={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Reopen' })).toBeInTheDocument()
  })

  it('calls onToggleStatus with the task when the toggle button is clicked', async () => {
    const task = makeTask()
    const onToggleStatus = vi.fn()
    const user = userEvent.setup()

    render(<TaskItem task={task} onToggleStatus={onToggleStatus} onDelete={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: 'Mark complete' }))

    expect(onToggleStatus).toHaveBeenCalledWith(task)
  })

  it('calls onDelete with the task when the delete button is clicked', async () => {
    const task = makeTask()
    const onDelete = vi.fn()
    const user = userEvent.setup()

    render(<TaskItem task={task} onToggleStatus={vi.fn()} onDelete={onDelete} />)
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onDelete).toHaveBeenCalledWith(task)
  })
})
