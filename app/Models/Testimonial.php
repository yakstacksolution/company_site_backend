<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = ['name', 'role', 'company', 'quote', 'avatar', 'rating', 'is_featured'];
    protected $casts = ['is_featured' => 'boolean'];
}
