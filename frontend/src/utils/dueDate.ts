const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

function absolute(date: Date): string {
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

/**
 * Renders a due date as a short, scannable phrase ("Overdue by 2d", "Due in
 * 3h") rather than a raw timestamp, so urgency is visible without reading
 * carefully. Falls back to an absolute date once it's far enough away (or
 * far enough in the past) that "in/by N units" stops being useful at a
 * glance.
 */
export function formatDueDate(dueDate: string | null, now: Date = new Date()): string {
  if (!dueDate) return 'No due date'

  const date = new Date(dueDate)
  const diffMs = date.getTime() - now.getTime()
  const overdue = diffMs < 0
  const absMs = Math.abs(diffMs)

  if (absMs < HOUR) {
    const minutes = Math.max(1, Math.round(absMs / MINUTE))
    return overdue ? `Overdue by ${minutes}m` : `Due in ${minutes}m`
  }

  if (absMs < DAY) {
    const hours = Math.round(absMs / HOUR)
    return overdue ? `Overdue by ${hours}h` : `Due in ${hours}h`
  }

  if (absMs < 14 * DAY) {
    const days = Math.round(absMs / DAY)
    return overdue ? `Overdue by ${days}d` : `Due in ${days}d`
  }

  return overdue ? `Was due ${absolute(date)}` : `Due ${absolute(date)}`
}

/** Full timestamp, for a tooltip alongside the short phrase above. */
export function formatDueDateExact(dueDate: string | null): string | undefined {
  return dueDate ? absolute(new Date(dueDate)) : undefined
}
