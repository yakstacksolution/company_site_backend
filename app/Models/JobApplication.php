<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    protected $fillable = ['job_id', 'job_title', 'name', 'email', 'phone', 'portfolio_url', 'cover_message', 'cv_key', 'cv_filename', 'cv_mime_type', 'consent_at', 'status', 'internal_notes'];
    protected $hidden = ['cv_key'];
    protected $casts = ['consent_at' => 'datetime'];
}
