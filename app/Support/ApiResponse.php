<?php

namespace App\Support;

trait ApiResponse
{
    protected function success(mixed $data = null, string $message = 'ok', int $status = 200)
    {
        return response()->json(['success' => true, 'message' => $message, 'data' => $data], $status);
    }

    protected function fail(string $message, int $status = 400, mixed $errors = null)
    {
        return response()->json(['success' => false, 'message' => $message, 'errors' => $errors], $status);
    }
}
