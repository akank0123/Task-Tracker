import type { AttentionReason } from '../api/tasks'

export const ATTENTION_LABELS: Record<Exclude<AttentionReason, null>, string> = {
  overdue: 'Overdue',
  due_soon: 'Due soon',
  high_priority_upcoming: 'High priority – due soon',
}

// Decorative only — the label text above is what's read by assistive tech.
export const ATTENTION_ICONS: Record<Exclude<AttentionReason, null>, string> = {
  overdue: '⚠',
  due_soon: '⏰',
  high_priority_upcoming: '★',
}

export function attentionLabel(reason: AttentionReason): string | null {
  return reason ? ATTENTION_LABELS[reason] : null
}

export function attentionIcon(reason: AttentionReason): string | null {
  return reason ? ATTENTION_ICONS[reason] : null
}
