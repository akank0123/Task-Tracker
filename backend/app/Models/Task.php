<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    /** @use HasFactory<\Database\Factories\TaskFactory> */
    use HasFactory;

    public const PRIORITIES = ['low', 'medium', 'high'];

    public const STATUSES = ['open', 'completed'];

    protected $fillable = [
        'title',
        'description',
        'priority',
        'status',
        'due_date',
    ];

    protected $casts = [
        'due_date' => 'datetime',
    ];

    // Mirrors the DB column defaults so a freshly-created model reflects the
    // correct values immediately, without requiring a refresh() round-trip.
    protected $attributes = [
        'priority' => 'medium',
        'status' => 'open',
    ];
}
