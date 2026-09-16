<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = ['name', 'logo', 'logo_alt', 'website', 'industry', 'country', 'summary', 'project_slug', 'since', 'is_featured', 'is_active', 'order'];
    protected $casts = ['is_featured' => 'boolean', 'is_active' => 'boolean'];
}
