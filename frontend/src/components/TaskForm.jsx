import { useState } from 'react'

const PRIORITIES = ['low', 'medium', 'high']

export function TaskForm({ onSubmit }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()

    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    setError(null)
    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      })
      setTitle('')
      setDescription('')
      setPriority('medium')
      setDueDate('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form__row">
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
        />
      </div>

      <div className="task-form__row">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details"
          rows={2}
        />
      </div>

      <div className="task-form__inline">
        <div className="task-form__row">
          <label htmlFor="task-priority">Priority</label>
          <select id="task-priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p[0].toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="task-form__row">
          <label htmlFor="task-due-date">Due date</label>
          <input
            id="task-due-date"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="task-form__error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="task-form__submit" disabled={submitting}>
        <span aria-hidden="true">{submitting ? '' : '+'}</span>
        {submitting ? 'Adding…' : 'Add task'}
      </button>
    </form>
  )
}
