export type FilterOption = 'all' | 'needs_attention' | 'completed'

interface FilterBarProps {
  value: FilterOption
  onChange: (value: FilterOption) => void
  needsAttentionCount: number
}

const OPTIONS: { value: FilterOption; label: string; icon: string }[] = [
  { value: 'all', label: 'All open', icon: '📋' },
  { value: 'needs_attention', label: 'Needs attention', icon: '⚠' },
  { value: 'completed', label: 'Completed', icon: '✓' },
]

export function FilterBar({ value, onChange, needsAttentionCount }: FilterBarProps) {
  return (
    <div className="filter-bar" role="tablist" aria-label="Task filters">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          className={`filter-bar__option${value === option.value ? ' filter-bar__option--active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          <span className="filter-bar__icon" aria-hidden="true">
            {option.icon}
          </span>
          {option.label}
          {option.value === 'needs_attention' && needsAttentionCount > 0 && (
            <span className="filter-bar__count">{needsAttentionCount}</span>
          )}
        </button>
      ))}
    </div>
  )
}
