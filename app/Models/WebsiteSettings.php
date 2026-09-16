<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WebsiteSettings extends Model
{
    protected $table = 'website_settings';
    protected $fillable = ['site_name', 'logo', 'favicon', 'primary_color', 'secondary_color', 'address', 'phone', 'email', 'founded_year', 'company_description', 'socials', 'seo'];
    protected $casts = ['socials' => 'array', 'seo' => 'array'];
}
