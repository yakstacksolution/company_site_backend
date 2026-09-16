<?php

namespace App\Http\Controllers;

use App\Models\TeamMember;

class TeamController extends ResourceController
{
    protected string $model = TeamMember::class;
    protected array $search = ['name', 'title'];
    protected array $sorts = ['order', 'name', 'created_at'];
    protected array $fallbackSort = ['order' => 'asc', 'created_at' => 'asc'];
    protected ?string $uploadField = 'photo';
    protected string $notFound = 'Team member not found';
    protected string $createdMessage = 'Team member created';
    protected string $updatedMessage = 'Team member updated';
    protected string $deletedMessage = 'Team member deleted';
    protected array $rules = ['name' => 'required|min:2', 'title' => 'required|min:2', 'bio' => 'nullable', 'photo' => 'nullable', 'order' => 'nullable|integer', 'linkedin' => 'nullable', 'twitter' => 'nullable', 'github' => 'nullable'];
    protected function normalizeKeys(array $payload): array { $p = parent::normalizeKeys($payload); foreach (['linkedin','twitter','github'] as $k) if (array_key_exists($k, $p)) { $p['socials'][$k] = $p[$k]; unset($p[$k]); } return $p; }
}
