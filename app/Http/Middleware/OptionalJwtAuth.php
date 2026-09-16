<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;

class OptionalJwtAuth
{
    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('Authorization', '');
        if (str_starts_with($header, 'Bearer ')) {
            try {
                $payload = (array) JWT::decode(substr($header, 7), new Key(env('JWT_SECRET', env('APP_KEY')), 'HS256'));
                if ($admin = Admin::query()->find($payload['id'] ?? null)) $request->attributes->set('admin_user', $admin);
            } catch (\Throwable) {
            }
        }
        return $next($request);
    }
}
