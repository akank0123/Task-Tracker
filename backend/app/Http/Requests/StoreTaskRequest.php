<?php

namespace App\Http\Requests;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['nullable', Rule::in(Task::PRIORITIES)],
            'status' => ['nullable', Rule::in(Task::STATUSES)],
            // Past due dates are allowed on purpose: tasks can be entered after the
            // fact (e.g. backfilled from another system) and should immediately
            // surface as overdue rather than being rejected.
            'due_date' => ['nullable', 'date'],
        ];
    }
}
