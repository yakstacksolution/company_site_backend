<?php

namespace App\Http\Controllers;

use App\Models\SiteContent;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class SiteContentController extends Controller
{
    use ApiResponse;
    private function load(): SiteContent { return SiteContent::query()->firstOrCreate(['locale' => 'en'], ['is_published' => true, 'hero' => ['headline' => 'Yak Stack Solution'], 'footer' => ['summary' => 'Software, cloud and product engineering.']]); }
    public function show(Request $request) { $content = $this->load(); if (!$content->is_published && !$request->attributes->get('admin_user')) return $this->fail('Site content is not published', 404); return $this->success($content); }
    public function update(Request $request) { $content = $this->load(); $content->fill(collect($request->all())->mapWithKeys(fn ($v, $k) => [str()->snake($k)->toString() => $v])->all())->save(); return $this->success($content->fresh(), 'Site content updated'); }
}
