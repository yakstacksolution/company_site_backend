<?php

namespace App\Http\Controllers;

use App\Models\AnalyticsEvent;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PageAnalyticsController extends Controller
{
    use ApiResponse;
    public function store(Request $request) { $data = $request->validate(['path' => 'required|starts_with:/|max:500', 'referrer' => 'nullable']); $ua = strtolower($request->userAgent() ?? ''); $device = str_contains($ua, 'mobile') ? 'mobile' : (str_contains($ua, 'tablet') ? 'tablet' : 'desktop'); AnalyticsEvent::create(['path' => $data['path'], 'referrer_host' => parse_url($data['referrer'] ?? '', PHP_URL_HOST), 'device' => $device, 'visitor_hash' => hash('sha256', $request->ip().env('ANALYTICS_SALT', env('APP_KEY'))), 'occurred_at' => now(), 'day' => now()->toDateString()]); return $this->success(null, 'Event recorded', 201); }
    public function index() { return $this->success(['items' => AnalyticsEvent::query()->select('path', DB::raw('count(*) as views'), DB::raw('count(distinct visitor_hash) as visitors'))->groupBy('path')->orderByDesc('views')->get()]); }
}
