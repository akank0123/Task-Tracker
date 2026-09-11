<?php

namespace Tests\Unit;

use App\Models\Task;
use App\Services\TaskAttentionService;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TaskAttentionServiceTest extends TestCase
{
    private TaskAttentionService $service;

    private Carbon $now;

    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new TaskAttentionService();
        $this->now = Carbon::parse('2026-01-15 12:00:00');
    }

    private function makeTask(array $overrides = []): Task
    {
        return Task::make(array_merge([
            'title' => 'Test task',
            'status' => 'open',
            'priority' => 'medium',
            'due_date' => null,
        ], $overrides));
    }

    #[Test]
    public function it_does_not_flag_a_completed_task_even_if_overdue(): void
    {
        $task = $this->makeTask([
            'status' => 'completed',
            'due_date' => $this->now->copy()->subDays(5),
        ]);

        $this->assertFalse($this->service->needsAttention($task, $this->now));
        $this->assertNull($this->service->evaluate($task, $this->now));
    }

    #[Test]
    public function it_does_not_flag_a_task_with_no_due_date_regardless_of_priority(): void
    {
        $task = $this->makeTask(['priority' => 'high', 'due_date' => null]);

        $this->assertFalse($this->service->needsAttention($task, $this->now));
    }

    #[Test]
    public function it_flags_a_task_due_in_the_past_as_overdue(): void
    {
        $task = $this->makeTask(['due_date' => $this->now->copy()->subMinute()]);

        $this->assertSame(TaskAttentionService::REASON_OVERDUE, $this->service->evaluate($task, $this->now));
    }

    #[Test]
    public function it_flags_a_task_due_exactly_now_as_due_soon_not_overdue(): void
    {
        $task = $this->makeTask(['due_date' => $this->now->copy()]);

        $this->assertSame(TaskAttentionService::REASON_DUE_SOON, $this->service->evaluate($task, $this->now));
    }

    #[Test]
    public function it_flags_a_task_due_within_the_next_24_hours_as_due_soon(): void
    {
        $task = $this->makeTask(['due_date' => $this->now->copy()->addHours(23)]);

        $this->assertSame(TaskAttentionService::REASON_DUE_SOON, $this->service->evaluate($task, $this->now));
    }

    #[Test]
    public function it_treats_the_24_hour_boundary_as_inclusive_for_due_soon(): void
    {
        $task = $this->makeTask(['due_date' => $this->now->copy()->addHours(24)]);

        $this->assertSame(TaskAttentionService::REASON_DUE_SOON, $this->service->evaluate($task, $this->now));
    }

    #[Test]
    public function it_does_not_flag_a_medium_priority_task_due_just_beyond_24_hours(): void
    {
        $task = $this->makeTask([
            'priority' => 'medium',
            'due_date' => $this->now->copy()->addHours(24)->addMinute(),
        ]);

        $this->assertNull($this->service->evaluate($task, $this->now));
    }

    #[Test]
    public function it_flags_a_high_priority_task_due_within_3_days_as_high_priority_upcoming(): void
    {
        $task = $this->makeTask([
            'priority' => 'high',
            'due_date' => $this->now->copy()->addDays(2),
        ]);

        $this->assertSame(
            TaskAttentionService::REASON_HIGH_PRIORITY_UPCOMING,
            $this->service->evaluate($task, $this->now)
        );
    }

    #[Test]
    public function it_treats_the_3_day_boundary_as_inclusive_for_high_priority_tasks(): void
    {
        $task = $this->makeTask([
            'priority' => 'high',
            'due_date' => $this->now->copy()->addDays(3),
        ]);

        $this->assertSame(
            TaskAttentionService::REASON_HIGH_PRIORITY_UPCOMING,
            $this->service->evaluate($task, $this->now)
        );
    }

    #[Test]
    public function it_does_not_flag_a_high_priority_task_due_beyond_3_days(): void
    {
        $task = $this->makeTask([
            'priority' => 'high',
            'due_date' => $this->now->copy()->addDays(3)->addMinute(),
        ]);

        $this->assertNull($this->service->evaluate($task, $this->now));
    }

    #[Test]
    public function it_does_not_flag_a_low_priority_task_due_in_2_days(): void
    {
        $task = $this->makeTask([
            'priority' => 'low',
            'due_date' => $this->now->copy()->addDays(2),
        ]);

        $this->assertNull($this->service->evaluate($task, $this->now));
    }

    #[Test]
    public function overdue_takes_precedence_over_high_priority_upcoming_reason(): void
    {
        $task = $this->makeTask([
            'priority' => 'high',
            'due_date' => $this->now->copy()->subDay(),
        ]);

        $this->assertSame(TaskAttentionService::REASON_OVERDUE, $this->service->evaluate($task, $this->now));
    }
}
