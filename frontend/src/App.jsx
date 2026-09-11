import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { ApiError, createTask, deleteTask, listTasks, updateTask } from './api/tasks'
import { FilterBar } from './components/FilterBar'
import { TaskForm } from './components/TaskForm'
import { TaskList } from './components/TaskList'

function filterToQuery(filter) {
  if (filter === 'needs_attention') return { needsAttention: true }
  if (filter === 'completed') return { status: 'completed' }
  return { status: 'open' }
}

function App() {
  const [filter, setFilter] = useState('all')
  const [tasks, setTasks] = useState([])
  const [attentionCount, setAttentionCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async (currentFilter) => {
    setLoading(true)
    setError(null)
    try {
      const [filtered, needingAttention] = await Promise.all([
        listTasks(filterToQuery(currentFilter)),
        listTasks({ needsAttention: true }),
      ])

      setTasks(filtered)
      setAttentionCount(needingAttention.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh(filter)
  }, [filter, refresh])

  async function handleCreate(input) {
    try {
      await createTask(input)
      await refresh(filter)
    } catch (err) {
      if (err instanceof ApiError) throw new Error(Object.values(err.fieldErrors).flat()[0] ?? err.message)
      throw err
    }
  }

  async function handleToggleStatus(task) {
    const nextStatus = task.status === 'completed' ? 'open' : 'completed'
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)))
    try {
      await updateTask(task.id, { status: nextStatus })
    } finally {
      await refresh(filter)
    }
  }

  async function handleDelete(task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id))
    try {
      await deleteTask(task.id)
    } finally {
      await refresh(filter)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__logo" aria-hidden="true">
          ✓
        </span>
        <h1>Task Tracker</h1>
      </header>

      <TaskForm onSubmit={handleCreate} />

      {attentionCount > 0 && filter !== 'needs_attention' && (
        <button type="button" className="app__banner" onClick={() => setFilter('needs_attention')}>
          <span aria-hidden="true">⚠</span>
          {attentionCount === 1
            ? '1 task needs your attention'
            : `${attentionCount} tasks need your attention`}
          <span className="app__banner-action">View →</span>
        </button>
      )}

      <FilterBar value={filter} onChange={setFilter} needsAttentionCount={attentionCount} />

      {error && (
        <p className="app__error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="app__loading" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          Loading tasks…
        </div>
      ) : (
        <TaskList tasks={tasks} onToggleStatus={handleToggleStatus} onDelete={handleDelete} />
      )}
    </div>
  )
}

export default App
