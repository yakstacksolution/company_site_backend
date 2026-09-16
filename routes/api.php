<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\PageAnalyticsController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SiteContentController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok', 'service' => 'yak-stack-solution', 'uptime' => floor(microtime(true) - LARAVEL_START)]));
Route::get('/ready', function () {
    try {
        DB::connection()->getPdo();
        return response()->json(['status' => 'ready', 'database' => 'connected']);
    } catch (Throwable) {
        return response()->json(['status' => 'unavailable', 'database' => 'disconnected'], 503);
    }
});

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,15');
Route::post('/auth/refresh', [AuthController::class, 'refresh']);
Route::post('/auth/logout', [AuthController::class, 'logout']);
Route::get('/auth/me', [AuthController::class, 'me'])->middleware('jwt');

Route::apiResource('admins', AdminController::class)->middleware(['jwt', 'role:admin']);

Route::get('/analytics', [AnalyticsController::class, 'index'])->middleware(['jwt', 'role:admin,editor']);
Route::post('/analytics/events', [PageAnalyticsController::class, 'store'])->middleware('throttle:60,1');
Route::get('/analytics/pages', [PageAnalyticsController::class, 'index'])->middleware(['jwt', 'role:admin,editor']);

Route::apiResource('services', ServiceController::class)->middleware(['jwt.optional'])->only(['index', 'show']);
Route::get('/services/slug/{slug}', [ServiceController::class, 'showBySlug'])->middleware('jwt.optional');
Route::apiResource('services', ServiceController::class)->except(['index', 'show'])->middleware(['jwt', 'role:admin,editor']);

Route::get('/projects/industries', [ProjectController::class, 'industries']);
Route::get('/projects/slug/{slug}', [ProjectController::class, 'showBySlug'])->middleware('jwt.optional');
Route::apiResource('projects', ProjectController::class)->middleware(['jwt.optional'])->only(['index', 'show']);
Route::apiResource('projects', ProjectController::class)->except(['index', 'show'])->middleware(['jwt', 'role:admin,editor']);

Route::get('/blogs/tags', [BlogController::class, 'tags'])->middleware('jwt.optional');
Route::get('/blogs/slug/{slug}', [BlogController::class, 'showBySlug'])->middleware('jwt.optional');
Route::apiResource('blogs', BlogController::class)->middleware(['jwt.optional'])->only(['index', 'show']);
Route::apiResource('blogs', BlogController::class)->except(['index', 'show'])->middleware(['jwt', 'role:admin,editor']);

Route::apiResource('team', TeamController::class)->only(['index', 'show']);
Route::apiResource('team', TeamController::class)->except(['index', 'show'])->middleware(['jwt', 'role:admin,editor']);
Route::apiResource('testimonials', TestimonialController::class)->only(['index', 'show']);
Route::apiResource('testimonials', TestimonialController::class)->except(['index', 'show'])->middleware(['jwt', 'role:admin,editor']);
Route::apiResource('customers', CustomerController::class)->only(['index', 'show']);
Route::apiResource('customers', CustomerController::class)->except(['index', 'show'])->middleware(['jwt', 'role:admin,editor']);

Route::get('/jobs/departments', [JobController::class, 'departments'])->middleware('jwt.optional');
Route::get('/jobs/slug/{slug}', [JobController::class, 'showBySlug'])->middleware('jwt.optional');
Route::apiResource('jobs', JobController::class)->middleware(['jwt.optional'])->only(['index', 'show']);
Route::apiResource('jobs', JobController::class)->except(['index', 'show'])->middleware(['jwt', 'role:admin,editor']);

Route::post('/job-applications', [JobApplicationController::class, 'store'])->middleware('throttle:10,1440');
Route::apiResource('job-applications', JobApplicationController::class)->except(['store'])->middleware(['jwt', 'role:admin,editor']);
Route::get('/job-applications/{job_application}/cv', [JobApplicationController::class, 'cv'])->middleware(['jwt', 'role:admin,editor']);

Route::post('/contacts', [ContactController::class, 'store'])->middleware('throttle:5,60');
Route::apiResource('contacts', ContactController::class)->except(['store'])->middleware(['jwt', 'role:admin,editor']);

Route::get('/settings', [SettingsController::class, 'show']);
Route::put('/settings', [SettingsController::class, 'update'])->middleware(['jwt', 'role:admin']);
Route::get('/site-content', [SiteContentController::class, 'show'])->middleware('jwt.optional');
Route::put('/site-content', [SiteContentController::class, 'update'])->middleware(['jwt', 'role:admin,editor']);

Route::apiResource('uploads', UploadController::class)->only(['index', 'store', 'destroy'])->middleware(['jwt', 'role:admin,editor']);
