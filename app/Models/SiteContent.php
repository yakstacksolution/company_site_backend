<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteContent extends Model
{
    protected $fillable = ['locale', 'is_published', 'navigation', 'hero', 'stats', 'sectors', 'about', 'differentiators', 'process', 'delivery', 'principles', 'sections', 'pages', 'benefits', 'contact_steps', 'contact_subjects', 'cta_assurances', 'cta', 'careers', 'footer', 'legal', 'seo'];
    protected $casts = [
        'is_published' => 'boolean',
        'navigation' => 'array', 'hero' => 'array', 'stats' => 'array', 'sectors' => 'array', 'about' => 'array',
        'differentiators' => 'array', 'process' => 'array', 'delivery' => 'array', 'principles' => 'array',
        'sections' => 'array', 'pages' => 'array', 'benefits' => 'array', 'contact_steps' => 'array',
        'contact_subjects' => 'array', 'cta_assurances' => 'array', 'cta' => 'array', 'careers' => 'array',
        'footer' => 'array', 'legal' => 'array', 'seo' => 'array',
    ];
}
