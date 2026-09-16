<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $fillable = ['title', 'slug', 'excerpt', 'content', 'cover_image', 'cover_image_alt', 'tags', 'author', 'status', 'published_at', 'reading_minutes', 'order', 'seo'];
    protected $casts = ['tags' => 'array', 'seo' => 'array', 'published_at' => 'datetime'];

    protected static function booted(): void
    {
        static::saving(function (Blog $blog) {
            if ($blog->isDirty('content')) {
                $words = str_word_count(strip_tags((string) $blog->content));
                $blog->reading_minutes = max(1, (int) round($words / 200));
            }
            if ($blog->status === 'published' && !$blog->published_at) {
                $blog->published_at = now();
            }
            if ($blog->status === 'draft') {
                $blog->published_at = null;
            }
        });
    }
}
