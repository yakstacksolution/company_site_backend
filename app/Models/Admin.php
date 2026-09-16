<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Admin extends Model
{
    protected $fillable = ['name', 'email', 'password', 'role', 'refresh_token_hash', 'last_login_at'];
    protected $hidden = ['password', 'refresh_token_hash'];
    protected $casts = ['last_login_at' => 'datetime'];

    public function setPasswordAttribute(string $value): void
    {
        $this->attributes['password'] = str_starts_with($value, '$2y$') ? $value : Hash::make($value);
    }
}
