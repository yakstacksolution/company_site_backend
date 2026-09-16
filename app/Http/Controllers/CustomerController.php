<?php

namespace App\Http\Controllers;

use App\Models\Customer;

class CustomerController extends ResourceController
{
    protected string $model = Customer::class;
    protected array $search = ['name', 'industry', 'country'];
    protected array $sorts = ['order', 'name', 'created_at'];
    protected array $fallbackSort = ['order' => 'asc'];
    protected ?string $uploadField = 'logo';
    protected string $notFound = 'Customer not found';
    protected string $createdMessage = 'Customer created';
    protected string $updatedMessage = 'Customer updated';
    protected string $deletedMessage = 'Customer deleted';
    protected array $rules = ['name' => 'required|min:2', 'logo' => 'nullable', 'logoAlt' => 'nullable', 'website' => 'nullable', 'industry' => 'nullable', 'country' => 'nullable', 'summary' => 'nullable', 'projectSlug' => 'nullable|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'since' => 'nullable|integer|min:1900|max:2200', 'isFeatured' => 'nullable|boolean', 'isActive' => 'nullable|boolean', 'order' => 'nullable|integer'];
}
