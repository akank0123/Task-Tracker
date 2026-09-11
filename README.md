# Task Tracker

A task list where the backend automatically **surfaces which tasks need attention** (open-ended acceptance criterion, interpreted below).

- **Backend:** Laravel 13 (PHP 8.3+), SQLite, PHPUnit
- **Frontend:** React 19 + TypeScript (Vite), Vitest + React Testing Library

```
task-tracker/
├── backend/   Laravel API
└── frontend/  React + TypeScript UI
```

## Setup and run

**Clone the repo:**
```sh
git clone <repository-url>
cd task-tracker
```

**Backend** (requires PHP 8.3+, Composer, `pdo_sqlite`):
```sh
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate
php artisan serve       # http://localhost:8000
```

**Frontend** (requires Node 20+, in a separate terminal from the project root):
```sh
cd frontend
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

## How to run the tests

```sh
cd backend && php artisan test    # 25 tests: unit (attention rule) + feature (API)
cd frontend && npm test           # 25 tests: components + integration + due-date util
```

## Assumptions

- Past due dates are allowed on create (e.g. backfilled tasks show as overdue immediately).
- Priority has 3 levels (low/medium/high), status has 2 (open/completed) — no sub-tasks, no assignees.
- Marking a task complete removes it from the "All open" view immediately.
- No auth/multi-user support — all tasks are global.
- CORS is left open (`*`) since this is a local exercise, not a deployed service.

## Key technical decisions

- **"Needs attention" rule** (the open-ended part): a task is flagged as `overdue` (past due), `due_soon` (due within 24h), or `high_priority_upcoming` (high priority, due within 3 days) — completed tasks and tasks with no due date are never flagged. Boundaries are inclusive; `overdue` wins if multiple reasons apply. See `TaskAttentionService` + its unit tests for the exact rule and edge cases.
- The flag is **computed per request, not stored**, so it can't go stale.
- **SQLite over a heavier DB** — this is a single-table feature with no relations; SQLite gives a clone-and-run setup with no infrastructure to install.
- **Due dates render as relative phrases** ("Overdue by 2d", "Due in 3h") for at-a-glance urgency, falling back to an absolute date beyond ~2 weeks.

## Limitations / what I'd do with more time

- "Needs attention" filtering/sorting happens in PHP over all matching rows — fine at this scale, would move to SQL/an indexed column at real scale.
- No pagination on `GET /api/tasks`.
- No optimistic-UI rollback if a `PATCH`/`DELETE` fails mid-flight.
- No automated E2E suite (verified manually instead).
- No timezone handling — due dates use the browser's local time.
