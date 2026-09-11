<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->optional()->paragraph(),
            'priority' => fake()->randomElement(Task::PRIORITIES),
            'status' => 'open',
            'due_date' => fake()->dateTimeBetween('-5 days', '+14 days'),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn () => ['status' => 'completed']);
    }

    public function priority(string $priority): static
    {
        return $this->state(fn () => ['priority' => $priority]);
    }

    public function dueAt(\DateTimeInterface|string|null $dueDate): static
    {
        return $this->state(fn () => ['due_date' => $dueDate]);
    }
}
