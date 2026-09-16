<?php

namespace App\Http\Controllers;

use App\Models\Job;

class JobController extends ResourceController
{
    protected string $model = Job::class;
    protected array $search = ['title', 'department', 'location'];
    protected array $sorts = ['order', 'title', 'created_at'];
    protected array $fallbackSort = ['order' => 'asc', 'created_at' => 'desc'];
    protected array $publicFilter = ['is_active' => true];
    protected string $notFound = 'Job not found';
    protected string $createdMessage = 'Job created';
    protected string $updatedMessage = 'Job updated';
    protected string $deletedMessage = 'Job deleted';
    protected array $rules = ['title' => 'required|min:2', 'slug' => 'nullable|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'department' => 'nullable', 'location' => 'nullable', 'type' => 'nullable|in:Full-time,Part-time,Contract,Internship', 'description' => 'required|min:10', 'requirements' => 'nullable', 'applyEmail' => 'required|email', 'isActive' => 'nullable|boolean', 'order' => 'nullable|integer'];
    public function departments() { return $this->success(['items' => Job::query()->whereNotNull('department')->distinct()->pluck('department')->filter()->sort()->values()]); }
}
