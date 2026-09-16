<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Job;
use App\Models\Project;
use App\Models\Service;

class SeoController extends Controller
{
    public function sitemap()
    {
        $base = rtrim(env('SITE_URL', env('APP_URL', 'http://localhost:5173')), '/');
        $entries = collect(['/', '/about', '/services', '/projects', '/blog', '/careers', '/contact', '/privacy', '/terms'])->map(fn ($p) => ['loc' => $base.$p, 'priority' => $p === '/' ? '1.0' : '0.8']);
        $dynamic = collect()
            ->merge(Service::where('is_active', true)->get()->map(fn ($i) => ['loc' => "$base/services/$i->slug", 'lastmod' => $i->updated_at, 'priority' => '0.7']))
            ->merge(Project::where('status', 'published')->get()->map(fn ($i) => ['loc' => "$base/projects/$i->slug", 'lastmod' => $i->updated_at, 'priority' => '0.7']))
            ->merge(Blog::where('status', 'published')->get()->map(fn ($i) => ['loc' => "$base/blog/$i->slug", 'lastmod' => $i->updated_at, 'priority' => '0.6']))
            ->merge(Job::where('is_active', true)->get()->map(fn ($i) => ['loc' => "$base/careers/$i->slug", 'lastmod' => $i->updated_at, 'priority' => '0.5']));
        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($entries->merge($dynamic) as $e) $xml .= "  <url>\n    <loc>{$e['loc']}</loc>\n".(isset($e['lastmod']) ? '    <lastmod>'.date('Y-m-d', strtotime($e['lastmod']))."</lastmod>\n" : '')."    <priority>{$e['priority']}</priority>\n  </url>\n";
        return response($xml."</urlset>\n", 200, ['Content-Type' => 'application/xml']);
    }
    public function robots() { $base = rtrim(env('SITE_URL', env('APP_URL', 'http://localhost:5173')), '/'); return response("User-agent: *\nAllow: /\n\nSitemap: $base/sitemap.xml\n", 200, ['Content-Type' => 'text/plain']); }
}
