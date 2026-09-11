import { TaskItem } from './TaskItem'

export function TaskList({ tasks, onToggleStatus, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div className="task-list__empty">
        <span className="task-list__empty-icon" aria-hidden="true">
          🗂
        </span>
        <p>No tasks match this filter.</p>
      </div>
    )
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggleStatus={onToggleStatus} onDelete={onDelete} />
      ))}
    </ul>
  )
}
