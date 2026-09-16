<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Support\ApiQuery;
use Illuminate\Http\Request;

class BlogController extends ResourceController
{
    protected string $model = Blog::class;
    protected array $search = ['title', 'excerpt', 'author'];
    protected array $sorts = ['published_at', 'title', 'created_at'];
    protected array $fallbackSort = ['published_at' => 'desc', 'created_at' => 'desc'];
    protected array $publicFilter = ['status' => 'published'];
    protected ?string $uploadField = 'coverImage';
    protected ?string $uploadColumn = 'cover_image';
    protected string $notFound = 'Blog not found';
    protected string $createdMessage = 'Blog created';
    protected string $updatedMessage = 'Blog updated';
    protected string $deletedMessage = 'Blog deleted';
    protected array $rules = ['title' => 'required|min:2', 'slug' => 'nullable|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', 'excerpt' => 'required|min:10', 'content' => 'required|min:20', 'coverImage' => 'nullable', 'coverImageAlt' => 'nullable', 'tags' => 'nullable', 'author' => 'required|min:2', 'status' => 'nullable|in:draft,published', 'order' => 'nullable|integer'];

    protected function applyIndexFilters($query, Request $request): void
    {
        if (request()->attributes->get('admin_user') && $request->query('status')) {
            $query->where('status', $request->query('status'));
        } else {
            $this->applyPublicVisibility($query);
        }
        if ($request->query('tag')) {
            $query->whereJsonContains('tags', $request->query('tag'));
        }
    }

    public function tags()
    {
        $query = Blog::query();
        $this->applyPublicVisibility($query);
        $tags = $query->pluck('tags')->flatten()->filter()->unique()->sort()->values();
        return $this->success(['items' => $tags]);
    }

    public function showBySlug(string $slug)
    {
        $query = Blog::query()->where('slug', $slug);
        $this->applyPublicVisibility($query);
        $blog = $query->first();
        if (!$blog) return $this->fail($this->notFound, 404);
        $related = Blog::query()->where('id', '!=', $blog->id)->where('status', 'published')->latest('published_at')->take(3)->get(['id', 'title', 'slug', 'excerpt', 'cover_image', 'tags', 'author', 'published_at', 'reading_minutes']);
        return $this->success(compact('blog', 'related'));
    }
}
