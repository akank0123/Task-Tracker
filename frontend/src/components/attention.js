export const ATTENTION_LABELS = {
  overdue: 'Overdue',
  due_soon: 'Due soon',
  high_priority_upcoming: 'High priority – due soon',
}

// Decorative only — the label text above is what's read by assistive tech.
export const ATTENTION_ICONS = {
  overdue: '⚠',
  due_soon: '⏰',
  high_priority_upcoming: '★',
}

export function attentionLabel(reason) {
  return reason ? ATTENTION_LABELS[reason] : null
}

export function attentionIcon(reason) {
  return reason ? ATTENTION_ICONS[reason] : null
}
