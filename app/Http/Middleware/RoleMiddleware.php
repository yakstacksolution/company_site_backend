<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles)
    {
        $admin = $request->attributes->get('admin_user');
        return $admin && in_array($admin->role, $roles, true) ? $next($request) : response()->json(['success' => false, 'message' => 'Forbidden'], 403);
    }
}
