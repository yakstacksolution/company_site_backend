<?php

namespace App\Http\Middleware;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class JsonApiErrors
{
    public static function render(Throwable $e)
    {
        if ($e instanceof ValidationException) return response()->json(['success' => false, 'message' => 'Validation failed', 'errors' => collect($e->errors())->flatMap(fn ($m, $f) => collect($m)->map(fn ($x) => ['field' => $f, 'message' => $x]))->values()], 422);
        if ($e instanceof AuthenticationException) return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        if ($e instanceof ModelNotFoundException) return response()->json(['success' => false, 'message' => 'Record not found'], 404);
        $status = $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;
        return response()->json(['success' => false, 'message' => app()->isProduction() && $status >= 500 ? 'Internal server error' : ($e->getMessage() ?: 'Server error'), 'errors' => null], $status);
    }
}
