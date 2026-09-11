import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FilterBar } from '../FilterBar'

describe('FilterBar', () => {
  it('marks the active filter as selected', () => {
    render(<FilterBar value="needs_attention" onChange={vi.fn()} needsAttentionCount={0} />)

    expect(screen.getByRole('tab', { name: /needs attention/i })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'All open' })).toHaveAttribute('aria-selected', 'false')
  })

  it('shows the needs-attention count only when greater than zero', () => {
    const { rerender } = render(<FilterBar value="all" onChange={vi.fn()} needsAttentionCount={0} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()

    rerender(<FilterBar value="all" onChange={vi.fn()} needsAttentionCount={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('calls onChange with the clicked filter', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup()

    render(<FilterBar value="all" onChange={onChange} needsAttentionCount={0} />)
    await user.click(screen.getByRole('tab', { name: 'Completed' }))

    expect(onChange).toHaveBeenCalledWith('completed')
  })
})
