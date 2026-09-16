<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = ['title', 'slug', 'summary', 'description', 'client', 'industry', 'tech_stack', 'cover_image', 'cover_image_alt', 'gallery', 'is_featured', 'status', 'order', 'seo'];
    protected $casts = ['tech_stack' => 'array', 'gallery' => 'array', 'seo' => 'array', 'is_featured' => 'boolean'];
}
