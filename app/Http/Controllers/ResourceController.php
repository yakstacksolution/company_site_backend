<?php

namespace App\Http\Controllers;

use App\Support\ApiQuery;
use App\Support\ApiResponse;
use App\Support\Slugs;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

abstract class ResourceController extends Controller
{
    use ApiResponse;

    protected string $model;
    protected array $search = [];
    protected array $sorts = ['created_at'];
    protected array $fallbackSort = ['created_at' => -1];
    protected array $rules = [];
    protected array $updateRules = [];
    protected ?string $uploadField = null;
    protected ?string $uploadColumn = null;
    protected array $publicFilter = [];
    protected string $notFound = 'Record not found';
    protected string $createdMessage = 'Record created';
    protected string $updatedMessage = 'Record updated';
    protected string $deletedMessage = 'Record deleted';

    public function index(Request $request)
    {
        $query = ($this->model)::query();
        $this->applyIndexFilters($query, $request);
        ApiQuery::search($query, $request->query('search'), $this->search);
        ApiQuery::sort($query, $request->query('sort'), $this->sorts, $this->fallbackSort);
        return $this->success(ApiQuery::page($query, $request));
    }

    public function show(int $id)
    {
        $query = ($this->model)::query();
        $this->applyPublicVisibility($query);
        $item = $query->find($id);
        return $item ? $this->success($item) : $this->fail($this->notFound, 404);
    }

    public function showBySlug(string $slug)
    {
        $query = ($this->model)::query()->where('slug', $slug);
        $this->applyPublicVisibility($query);
        $item = $query->first();
        return $item ? $this->success($item) : $this->fail($this->notFound, 404);
    }

    public function store(Request $request)
    {
        $payload = $this->validated($request, $this->rules);
        $payload = $this->preparePayload($payload, $request);
        /** @var Model $item */
        $item = ($this->model)::query()->create($payload);
        return $this->success($item, $this->createdMessage, 201);
    }

    public function update(Request $request, int $id)
    {
        $item = ($this->model)::query()->find($id);
        if (!$item) {
            return $this->fail($this->notFound, 404);
        }
        $payload = $this->validated($request, $this->updateRules ?: $this->rules, true);
        $payload = $this->preparePayload($payload, $request, $item);
        $item->fill($payload)->save();
        return $this->success($item->refresh(), $this->updatedMessage);
    }

    public function destroy(int $id)
    {
        $item = ($this->model)::query()->find($id);
        if (!$item) {
            return $this->fail($this->notFound, 404);
        }
        $item->delete();
        return $this->success(null, $this->deletedMessage);
    }

    protected function validated(Request $request, array $rules, bool $partial = false): array
    {
        if ($partial) {
            $rules = collect($rules)->map(fn ($rule) => str_contains((string) $rule, 'required') ? str_replace('required', 'sometimes', (string) $rule) : 'sometimes|'.$rule)->all();
        }
        return $request->validate($rules);
    }

    protected function preparePayload(array $payload, Request $request, ?Model $existing = null): array
    {
        $payload = $this->normalizeKeys($payload);
        $supportsSlug = in_array('slug', (new $this->model)->getFillable(), true);
        if ($supportsSlug && empty($payload['slug']) && !empty($payload['title'])) {
            $payload['slug'] = Slugs::unique($this->model, $payload['title'], $existing?->id);
        }
        if ($this->uploadField && $request->hasFile($this->uploadField)) {
            $payload[$this->uploadColumn ?: Str::snake($this->uploadField)] = app(UploadController::class)->persistPublicUpload($request->file($this->uploadField));
        }
        return $payload;
    }

    protected function normalizeKeys(array $payload): array
    {
        $normalized = [];
        foreach ($payload as $key => $value) {
            if (is_string($value) && str_contains($value, ',') && in_array($key, ['features', 'gallery', 'tags', 'techStack', 'requirements'], true)) {
                $value = array_values(array_filter(array_map('trim', explode(',', $value))));
            }
            $normalized[Str::snake($key)] = $value;
        }
        return $normalized;
    }

    protected function applyIndexFilters($query, Request $request): void
    {
        $this->applyPublicVisibility($query);
    }

    protected function applyPublicVisibility($query): void
    {
        if (request()->attributes->get('admin_user')) {
            return;
        }
        foreach ($this->publicFilter as $field => $value) {
            $query->where($field, $value);
        }
    }
}
