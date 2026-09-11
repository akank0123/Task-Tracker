import { formatDueDate, formatDueDateExact } from '../utils/dueDate'
import { attentionIcon, attentionLabel } from './attention'

export function TaskItem({ task, onToggleStatus, onDelete }) {
  const label = attentionLabel(task.attention_reason)
  const icon = attentionIcon(task.attention_reason)
  const isCompleted = task.status === 'completed'

  return (
    <li className={`task-item task-item--${task.priority}${isCompleted ? ' task-item--completed' : ''}`}>
      <div className="task-item__main">
        <div className="task-item__title-row">
          <span className="task-item__title">{task.title}</span>
          <span className={`badge badge--priority-${task.priority}`}>
            <span className="badge__dot" aria-hidden="true" />
            {task.priority}
          </span>
          {label && (
            <span className={`badge badge--attention badge--attention-${task.attention_reason}`}>
              <span className="badge__icon" aria-hidden="true">
                {icon}
              </span>
              <span>{label}</span>
            </span>
          )}
        </div>
        {task.description && <p className="task-item__description">{task.description}</p>}
        <p className="task-item__due" title={formatDueDateExact(task.due_date)}>
          {formatDueDate(task.due_date)}
        </p>
      </div>

      <div className="task-item__actions">
        <button
          type="button"
          className="task-item__toggle"
          onClick={() => onToggleStatus(task)}
          aria-pressed={isCompleted}
        >
          <span className="task-item__toggle-mark" aria-hidden="true">
            {isCompleted ? '✓' : ''}
          </span>
          {isCompleted ? 'Reopen' : 'Mark complete'}
        </button>
        <button
          type="button"
          className="task-item__delete"
          onClick={() => onDelete(task)}
          aria-label="Delete"
          title="Delete"
        >
          <span aria-hidden="true">🗑</span>
        </button>
      </div>
    </li>
  )
}
