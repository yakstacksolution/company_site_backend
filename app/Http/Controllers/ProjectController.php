<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class ProjectController extends ResourceController
{
    use ApiResponse;
    protected string $model = Project::class;
    protected array $search = ['title', 'summary', 'client'];
    protected array $sorts = ['order', 'title', 'created_at'];
    protected array $fallbackSort = ['order' => 'asc'];
    protected array $publicFilter = ['status' => 'published'];
    protected ?string $uploadField = 'coverImage';
    protected ?string $uploadColumn = 'cover_image';
    protected string $notFound = 'Project not found';
    protected string $createdMessage = 'Project created';
    protected string $updatedMessage = 'Project updated';
    protected string $deletedMessage = 'Project deleted';
    protected array $rules = ['title' => 'required|min:2', 'slug' => 'nullable|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'summary' => 'required|min:10', 'description' => 'nullable', 'client' => 'nullable', 'industry' => 'nullable', 'techStack' => 'nullable', 'coverImage' => 'nullable', 'coverImageAlt' => 'nullable', 'gallery' => 'nullable', 'isFeatured' => 'nullable|boolean', 'status' => 'nullable|in:draft,published', 'order' => 'nullable|integer'];
    public function industries() { return $this->success(['items' => Project::query()->whereNotNull('industry')->distinct()->pluck('industry')->filter()->sort()->values()]); }
}
