<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalyticsEvent extends Model
{
    public $timestamps = false;
    protected $fillable = ['path', 'referrer_host', 'device', 'visitor_hash', 'occurred_at', 'day'];
    protected $casts = ['occurred_at' => 'datetime'];
}
