<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Support\ApiResponse;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    use ApiResponse;

    public function login(Request $request)
    {
        $data = $request->validate(['email' => 'required|email', 'password' => 'required']);
        $admin = Admin::query()->where('email', $data['email'])->first();
        if (!$admin || !Hash::check($data['password'], $admin->password)) {
            return $this->fail('Invalid credentials', 401);
        }
        $tokens = $this->issueTokens($admin);
        $admin->forceFill(['refresh_token_hash' => hash('sha256', $tokens['refreshToken']), 'last_login_at' => now()])->save();
        return $this->success(['accessToken' => $tokens['accessToken'], 'admin' => $admin->fresh()], 'Login successful')->cookie('refreshToken', $tokens['refreshToken'], 60 * 24 * 7, '/api/auth', null, app()->isProduction(), true, false, 'Strict');
    }

    public function refresh(Request $request)
    {
        $token = $request->cookie('refreshToken') ?: $request->input('refreshToken');
        if (!$token) return $this->fail('Refresh token is required', 401);
        try { $payload = (array) JWT::decode($token, new Key(env('JWT_REFRESH_SECRET', env('APP_KEY')), 'HS256')); }
        catch (\Throwable) { return $this->fail('Invalid refresh token', 401); }
        $admin = Admin::query()->find($payload['id'] ?? null);
        if (!$admin || $admin->refresh_token_hash !== hash('sha256', $token)) return $this->fail('Refresh token mismatch', 401);
        $tokens = $this->issueTokens($admin);
        $admin->forceFill(['refresh_token_hash' => hash('sha256', $tokens['refreshToken'])])->save();
        return $this->success(['accessToken' => $tokens['accessToken'], 'admin' => $admin->fresh()], 'Token refreshed')->cookie('refreshToken', $tokens['refreshToken'], 60 * 24 * 7, '/api/auth', null, app()->isProduction(), true, false, 'Strict');
    }

    public function me(Request $request) { return $this->success($request->attributes->get('admin_user')); }

    public function logout(Request $request)
    {
        $token = $request->cookie('refreshToken') ?: $request->input('refreshToken');
        if ($token) Admin::query()->where('refresh_token_hash', hash('sha256', $token))->update(['refresh_token_hash' => null]);
        return $this->success(null, 'Logged out')->withoutCookie('refreshToken', '/api/auth');
    }

    private function issueTokens(Admin $admin): array
    {
        $payload = ['id' => $admin->id, 'role' => $admin->role, 'email' => $admin->email, 'iat' => time()];
        return [
            'accessToken' => JWT::encode($payload + ['exp' => time() + $this->seconds(env('JWT_EXPIRES_IN', '15m'))], env('JWT_SECRET', env('APP_KEY')), 'HS256'),
            'refreshToken' => JWT::encode($payload + ['jti' => (string) str()->uuid(), 'exp' => time() + $this->seconds(env('JWT_REFRESH_EXPIRES_IN', '7d'))], env('JWT_REFRESH_SECRET', env('APP_KEY')), 'HS256'),
        ];
    }

    private function seconds(string $ttl): int
    {
        return preg_match('/^(\d+)([mhd])$/', $ttl, $m) ? (int) $m[1] * ['m' => 60, 'h' => 3600, 'd' => 86400][$m[2]] : (int) $ttl;
    }
}
