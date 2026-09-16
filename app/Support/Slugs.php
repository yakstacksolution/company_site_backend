<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Slugs
{
    public static function unique(string $modelClass, string $source, ?int $excludeId = null): string
    {
        /** @var class-string<Model> $modelClass */
        $base = Str::slug($source) ?: 'item';
        $candidate = $base;
        $suffix = 1;

        while ($modelClass::query()->where('slug', $candidate)->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))->exists()) {
            $suffix++;
            $candidate = "{$base}-{$suffix}";
        }

        return $candidate;
    }
}
