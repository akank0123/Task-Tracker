import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TaskForm } from '../TaskForm'

describe('TaskForm', () => {
  it('shows a validation error and does not submit when the title is blank', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()

    render(<TaskForm onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Title is required.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits the trimmed title and selected priority', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(<TaskForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Title'), '  Ship the feature  ')
    await user.selectOptions(screen.getByLabelText('Priority'), 'high')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Ship the feature', priority: 'high' })
    )
  })

  it('clears the form after a successful submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    render(<TaskForm onSubmit={onSubmit} />)
    const titleInput = screen.getByLabelText('Title')
    await user.type(titleInput, 'Temporary title')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(await screen.findByLabelText('Title')).toHaveValue('')
  })

  it('shows an error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server exploded'))
    const user = userEvent.setup()

    render(<TaskForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText('Title'), 'Doomed task')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Server exploded')
  })
})
