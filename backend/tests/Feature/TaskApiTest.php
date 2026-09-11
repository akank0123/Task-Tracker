<?php

namespace Tests\Feature;

use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_lists_tasks_with_computed_attention_fields(): void
    {
        Task::factory()->create(['title' => 'Overdue task', 'due_date' => now()->subDay()]);
        Task::factory()->create(['title' => 'Future task', 'due_date' => now()->addMonth()]);

        $response = $this->getJson('/api/tasks');

        $response->assertOk()->assertJsonCount(2, 'data');
        $response->assertJsonFragment(['title' => 'Overdue task', 'needs_attention' => true, 'attention_reason' => 'overdue']);
        $response->assertJsonFragment(['title' => 'Future task', 'needs_attention' => false, 'attention_reason' => null]);
    }

    #[Test]
    public function it_lists_tasks_with_no_due_date_sorted_after_tasks_with_one(): void
    {
        Task::factory()->create(['title' => 'No due date', 'due_date' => null]);
        Task::factory()->create(['title' => 'Has due date', 'due_date' => now()->addWeek()]);

        $response = $this->getJson('/api/tasks');

        $response->assertOk()->assertJsonCount(2, 'data');
        $response->assertJsonPath('data.0.title', 'Has due date');
        $response->assertJsonPath('data.1.title', 'No due date');
    }

    #[Test]
    public function it_filters_tasks_needing_attention(): void
    {
        Task::factory()->create(['title' => 'Overdue task', 'due_date' => now()->subDay()]);
        Task::factory()->create(['title' => 'Safe task', 'due_date' => now()->addMonth()]);
        Task::factory()->create([
            'title' => 'Completed but overdue',
            'status' => 'completed',
            'due_date' => now()->subDay(),
        ]);

        $response = $this->getJson('/api/tasks?needs_attention=1');

        $response->assertOk()->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.title', 'Overdue task');
    }

    #[Test]
    public function it_filters_tasks_by_status(): void
    {
        Task::factory()->create(['status' => 'open']);
        Task::factory()->create(['status' => 'completed']);

        $response = $this->getJson('/api/tasks?status=completed');

        $response->assertOk()->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.status', 'completed');
    }

    #[Test]
    public function it_creates_a_task(): void
    {
        $payload = [
            'title' => 'Write the README',
            'priority' => 'high',
            'due_date' => Carbon::parse('2026-02-01 09:00:00')->toIso8601String(),
        ];

        $response = $this->postJson('/api/tasks', $payload);

        $response->assertCreated();
        $response->assertJsonPath('data.title', 'Write the README');
        $response->assertJsonPath('data.priority', 'high');
        $response->assertJsonPath('data.status', 'open');
        $this->assertDatabaseHas('tasks', ['title' => 'Write the README']);
    }

    #[Test]
    public function it_allows_creating_a_task_with_a_past_due_date(): void
    {
        $response = $this->postJson('/api/tasks', [
            'title' => 'Backfilled task',
            'due_date' => now()->subWeek()->toIso8601String(),
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.needs_attention', true);
        $response->assertJsonPath('data.attention_reason', 'overdue');
    }

    #[Test]
    public function it_rejects_creating_a_task_without_a_title(): void
    {
        $response = $this->postJson('/api/tasks', ['priority' => 'high']);

        $response->assertStatus(422)->assertJsonValidationErrors(['title']);
    }

    #[Test]
    public function it_rejects_an_invalid_priority(): void
    {
        $response = $this->postJson('/api/tasks', ['title' => 'Bad task', 'priority' => 'urgent']);

        $response->assertStatus(422)->assertJsonValidationErrors(['priority']);
    }

    #[Test]
    public function it_shows_a_single_task(): void
    {
        $task = Task::factory()->create();

        $response = $this->getJson("/api/tasks/{$task->id}");

        $response->assertOk()->assertJsonPath('data.id', $task->id);
    }

    #[Test]
    public function it_returns_404_for_a_missing_task(): void
    {
        $response = $this->getJson('/api/tasks/999');

        $response->assertStatus(404);
    }

    #[Test]
    public function it_updates_a_task_partially(): void
    {
        $task = Task::factory()->create(['title' => 'Old title', 'priority' => 'low']);

        $response = $this->patchJson("/api/tasks/{$task->id}", ['title' => 'New title']);

        $response->assertOk();
        $response->assertJsonPath('data.title', 'New title');
        $response->assertJsonPath('data.priority', 'low');
    }

    #[Test]
    public function it_can_mark_a_task_completed_so_it_stops_needing_attention(): void
    {
        $task = Task::factory()->create(['due_date' => now()->subDay()]);

        $response = $this->patchJson("/api/tasks/{$task->id}", ['status' => 'completed']);

        $response->assertOk();
        $response->assertJsonPath('data.needs_attention', false);
    }

    #[Test]
    public function it_deletes_a_task(): void
    {
        $task = Task::factory()->create();

        $response = $this->deleteJson("/api/tasks/{$task->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }
}
