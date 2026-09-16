<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    protected $fillable = ['title', 'slug', 'department', 'location', 'type', 'description', 'requirements', 'apply_email', 'is_active', 'order', 'seo'];
    protected $casts = ['requirements' => 'array', 'seo' => 'array', 'is_active' => 'boolean'];
}
