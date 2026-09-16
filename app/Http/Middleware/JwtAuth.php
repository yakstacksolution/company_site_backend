<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;

class JwtAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = str_starts_with($request->header('Authorization', ''), 'Bearer ') ? substr($request->header('Authorization'), 7) : null;
        if (!$token) return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        try { $payload = (array) JWT::decode($token, new Key(env('JWT_SECRET', env('APP_KEY')), 'HS256')); }
        catch (\Throwable $e) { return response()->json(['success' => false, 'message' => str_contains($e->getMessage(), 'Expired') ? 'Token expired' : 'Invalid token'], 401); }
        $admin = Admin::query()->find($payload['id'] ?? null);
        if (!$admin) return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        $request->attributes->set('admin_user', $admin);
        return $next($request);
    }
}
