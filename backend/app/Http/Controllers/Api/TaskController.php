<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TaskAttentionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(Request $request, TaskAttentionService $attention): JsonResponse
    {
        $request->validate([
            'status' => ['sometimes', Rule::in(Task::STATUSES)],
            'needs_attention' => ['sometimes', 'boolean'],
        ]);

        $tasks = Task::query()
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->query('status')))
            ->orderByRaw('due_date IS NULL, due_date ASC')
            ->get();

        if ($request->boolean('needs_attention')) {
            $tasks = $tasks->filter(fn (Task $task) => $attention->needsAttention($task))->values();
        }

        return TaskResource::collection($tasks)->response();
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = Task::create($request->validated());

        return (new TaskResource($task))->response()->setStatusCode(Response::HTTP_CREATED);
    }

    public function show(Task $task): JsonResponse
    {
        return (new TaskResource($task))->response();
    }

    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $task->update($request->validated());

        return (new TaskResource($task))->response();
    }

    public function destroy(Task $task): Response
    {
        $task->delete();

        return response()->noContent();
    }
}
