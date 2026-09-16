<?php

namespace App\Http\Controllers;

use App\Models\Service;

class ServiceController extends ResourceController
{
    protected string $model = Service::class;
    protected array $search = ['title', 'description'];
    protected array $sorts = ['order', 'title', 'created_at'];
    protected array $fallbackSort = ['order' => 'asc'];
    protected array $publicFilter = ['is_active' => true];
    protected string $notFound = 'Service not found';
    protected string $createdMessage = 'Service created';
    protected string $updatedMessage = 'Service updated';
    protected string $deletedMessage = 'Service deleted';
    protected array $rules = ['title' => 'required|min:2', 'slug' => 'nullable|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'description' => 'required|min:10', 'icon' => 'nullable', 'image' => 'nullable', 'imageAlt' => 'nullable', 'features' => 'nullable', 'isActive' => 'nullable|boolean', 'order' => 'nullable|integer'];
}
