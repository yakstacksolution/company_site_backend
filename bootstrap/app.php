<?php

use App\Http\Middleware\JsonApiErrors;
use App\Http\Middleware\JwtAuth;
use App\Http\Middleware\OptionalJwtAuth;
use App\Http\Middleware\RoleMiddleware;
use Illuminate\Http\Middleware\HandleCors;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        using: function () {
            Route::middleware('api')->prefix('api')->group(base_path('routes/api.php'));
            Route::middleware('api')->group(base_path('routes/web.php'));
        },
        commands: __DIR__.'/../routes/console.php',
        health: '/up'
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->append(HandleCors::class);
        $middleware->alias([
            'jwt' => JwtAuth::class,
            'jwt.optional' => OptionalJwtAuth::class,
            'role' => RoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if (!$request->expectsJson() && !str_starts_with($request->path(), 'api/')) {
                return null;
            }

            return JsonApiErrors::render($e);
        });
    })
    ->create();
