<?php

namespace App\Services;

use App\Models\Task;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

/**
 * Decides whether a task "needs attention" and why.
 *
 * This is the open-ended piece of the exercise: the brief only says the system
 * should "surface tasks that need attention". The rule implemented here is:
 *
 *   - Completed tasks, and tasks with no due date, never need attention.
 *   - A task is OVERDUE if its due date is in the past.
 *   - A task is DUE_SOON if its due date falls within the next 24 hours.
 *   - A HIGH priority task is flagged early (HIGH_PRIORITY_UPCOMING) if it falls
 *     due within the next 3 days, even before it would otherwise be "due soon".
 *
 * All thresholds are pure/deterministic given an injectable "now", which keeps
 * the boundary conditions (exactly 24h, exactly 3 days, etc.) unit-testable
 * without freezing global time or touching the database.
 */
class TaskAttentionService
{
    public const REASON_OVERDUE = 'overdue';

    public const REASON_DUE_SOON = 'due_soon';

    public const REASON_HIGH_PRIORITY_UPCOMING = 'high_priority_upcoming';

    private const DUE_SOON_WINDOW_HOURS = 24;

    private const HIGH_PRIORITY_WINDOW_DAYS = 3;

    /**
     * Returns the reason a task needs attention, or null if it doesn't.
     */
    public function evaluate(Task $task, ?CarbonInterface $now = null): ?string
    {
        $now = $now ?? Carbon::now();

        if ($task->status === 'completed' || $task->due_date === null) {
            return null;
        }

        if ($task->due_date->lessThan($now)) {
            return self::REASON_OVERDUE;
        }

        if ($task->due_date->lessThanOrEqualTo($now->copy()->addHours(self::DUE_SOON_WINDOW_HOURS))) {
            return self::REASON_DUE_SOON;
        }

        if ($task->priority === 'high'
            && $task->due_date->lessThanOrEqualTo($now->copy()->addDays(self::HIGH_PRIORITY_WINDOW_DAYS))) {
            return self::REASON_HIGH_PRIORITY_UPCOMING;
        }

        return null;
    }

    public function needsAttention(Task $task, ?CarbonInterface $now = null): bool
    {
        return $this->evaluate($task, $now) !== null;
    }
}
