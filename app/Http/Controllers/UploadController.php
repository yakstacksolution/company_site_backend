<?php

namespace App\Http\Controllers;

use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    use ApiResponse;
    public function persistPublicUpload($file): string { $name = Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)) . '-' . now()->timestamp . '-' . Str::random(8) . '.' . $file->extension(); $file->storeAs('public/uploads', $name); return '/storage/uploads/'.$name; }
    public function index() { $items = collect(Storage::files('public/uploads'))->map(fn ($p) => ['filename' => basename($p), 'url' => '/storage/uploads/'.basename($p), 'size' => Storage::size($p), 'uploadedAt' => date('c', Storage::lastModified($p))])->sortByDesc('uploadedAt')->values(); return $this->success(['items' => $items, 'total' => $items->count()]); }
    public function store(Request $request) { $request->validate(['file' => 'required']); $files = is_array($request->file('file')) ? $request->file('file') : [$request->file('file')]; $items = collect($files)->map(fn ($file) => ['url' => $this->persistPublicUpload($file), 'filename' => $file->getClientOriginalName(), 'size' => $file->getSize(), 'mimetype' => $file->getMimeType()])->values(); return $this->success($items->first() + ['items' => $items], 'File uploaded', 201); }
    public function destroy(string $filename) { $path = 'public/uploads/'.basename($filename); if (!Storage::exists($path)) return $this->fail('File not found', 404); Storage::delete($path); return $this->success(null, 'File deleted'); }
}
