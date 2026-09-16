<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\Request;

class TestimonialController extends ResourceController
{
    protected string $model = Testimonial::class;
    protected array $search = ['name', 'company', 'quote'];
    protected array $sorts = ['name', 'rating', 'created_at'];
    protected ?string $uploadField = 'avatar';
    protected string $notFound = 'Testimonial not found';
    protected string $createdMessage = 'Testimonial created';
    protected string $updatedMessage = 'Testimonial updated';
    protected string $deletedMessage = 'Testimonial deleted';
    protected array $rules = ['name' => 'required|min:2', 'role' => 'nullable', 'company' => 'nullable', 'quote' => 'required|min:10', 'avatar' => 'nullable', 'rating' => 'nullable|integer|min:1|max:5', 'isFeatured' => 'nullable|boolean'];
    protected function applyIndexFilters($query, Request $request): void { if ($request->has('featured')) $query->where('is_featured', filter_var($request->query('featured'), FILTER_VALIDATE_BOOL)); }
}
