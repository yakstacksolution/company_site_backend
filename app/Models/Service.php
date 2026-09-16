<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $fillable = ['title', 'slug', 'description', 'icon', 'image', 'image_alt', 'features', 'is_active', 'order', 'seo'];
    protected $casts = ['features' => 'array', 'seo' => 'array', 'is_active' => 'boolean'];
}
