<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApiQuery
{
    public static function paginate(Request $request): array
    {
        $page = max((int) $request->query('page', 1), 1);
        $limit = min(max((int) $request->query('limit', 10), 1), 100);
        return [$page, $limit];
    }

    public static function search(Builder $query, ?string $term, array $fields): void
    {
        $term = trim((string) $term);
        if ($term === '' || empty($fields)) {
            return;
        }
        $query->where(function (Builder $inner) use ($term, $fields) {
            foreach ($fields as $field) {
                $inner->orWhere($field, 'like', '%'.str_replace(['%', '_'], ['\\%', '\\_'], $term).'%');
            }
        });
    }

    public static function sort(Builder $query, ?string $sort, array $allowed, array $fallback): void
    {
        if ($sort) {
            $direction = Str::startsWith($sort, '-') ? 'desc' : 'asc';
            $field = ltrim($sort, '-');
            if (in_array($field, $allowed, true)) {
                $query->orderBy($field, $direction);
                return;
            }
        }
        foreach ($fallback as $field => $direction) {
            $query->orderBy($field, $direction === -1 ? 'desc' : $direction);
        }
    }

    public static function page(Builder $query, Request $request): array
    {
        [$page, $limit] = self::paginate($request);
        $total = (clone $query)->count();
        $items = $query->skip(($page - 1) * $limit)->take($limit)->get();
        return compact('items', 'total', 'page', 'limit') + ['pages' => (int) ceil($total / $limit)];
    }
}
