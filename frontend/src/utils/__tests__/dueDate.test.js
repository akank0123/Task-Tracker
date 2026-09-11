import { describe, expect, it } from 'vitest'
import { formatDueDate } from '../dueDate'

const NOW = new Date('2026-01-15T12:00:00Z')

describe('formatDueDate', () => {
  it('returns a placeholder when there is no due date', () => {
    expect(formatDueDate(null, NOW)).toBe('No due date')
  })

  it('renders minutes for a date less than an hour away', () => {
    expect(formatDueDate(new Date(NOW.getTime() + 30 * 60_000).toISOString(), NOW)).toBe('Due in 30m')
  })

  it('renders minutes for a date less than an hour in the past', () => {
    expect(formatDueDate(new Date(NOW.getTime() - 5 * 60_000).toISOString(), NOW)).toBe('Overdue by 5m')
  })

  it('renders hours for a date less than a day away', () => {
    expect(formatDueDate(new Date(NOW.getTime() + 5 * 60 * 60_000).toISOString(), NOW)).toBe('Due in 5h')
  })

  it('renders hours for a date less than a day in the past', () => {
    expect(formatDueDate(new Date(NOW.getTime() - 3 * 60 * 60_000).toISOString(), NOW)).toBe('Overdue by 3h')
  })

  it('renders days for a date within two weeks', () => {
    expect(formatDueDate(new Date(NOW.getTime() + 3 * 24 * 60 * 60_000).toISOString(), NOW)).toBe('Due in 3d')
  })

  it('renders days for a date overdue within two weeks', () => {
    expect(formatDueDate(new Date(NOW.getTime() - 2 * 24 * 60 * 60_000).toISOString(), NOW)).toBe('Overdue by 2d')
  })

  it('falls back to an absolute date beyond two weeks out', () => {
    const farFuture = new Date(NOW.getTime() + 30 * 24 * 60 * 60_000).toISOString()
    expect(formatDueDate(farFuture, NOW)).toMatch(/^Due /)
    expect(formatDueDate(farFuture, NOW)).not.toMatch(/\dd$/)
  })

  it('falls back to an absolute date beyond two weeks in the past', () => {
    const farPast = new Date(NOW.getTime() - 30 * 24 * 60 * 60_000).toISOString()
    expect(formatDueDate(farPast, NOW)).toMatch(/^Was due /)
  })
})
