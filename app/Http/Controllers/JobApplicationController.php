<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobApplication;
use App\Support\ApiQuery;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class JobApplicationController extends Controller
{
    use ApiResponse;
    public function store(Request $request)
    {
        $data = $request->validate(['jobId' => 'required|integer|exists:jobs,id', 'name' => 'required|min:2|max:120', 'email' => 'required|email', 'phone' => 'nullable', 'portfolioUrl' => 'nullable', 'coverMessage' => 'required|min:20|max:5000', 'consent' => 'accepted', 'honeypot' => 'nullable|max:0', 'cv' => 'required|file|max:5120']);
        $job = Job::query()->where('is_active', true)->find($data['jobId']);
        if (!$job) return $this->fail('Job not found', 404);
        $file = $request->file('cv');
        $key = 'cvs/'.Str::uuid().'-'.Str::slug(pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)).'.'.$file->extension();
        Storage::putFileAs('private/cvs', $file, basename($key));
        $application = JobApplication::create(['job_id' => $job->id, 'job_title' => $job->title, 'name' => $data['name'], 'email' => strtolower($data['email']), 'phone' => $data['phone'] ?? null, 'portfolio_url' => $data['portfolioUrl'] ?? null, 'cover_message' => $data['coverMessage'], 'cv_key' => $key, 'cv_filename' => $file->getClientOriginalName(), 'cv_mime_type' => $file->getMimeType(), 'consent_at' => now()]);
        return $this->success(['id' => $application->id, 'name' => $application->name], 'Application received', 201);
    }
    public function index(Request $request) { $q = JobApplication::query(); if ($request->query('status')) $q->where('status', $request->query('status')); ApiQuery::search($q, $request->query('search'), ['name', 'email', 'job_title']); $q->latest(); return $this->success(ApiQuery::page($q, $request)); }
    public function show(int $id) { $item = JobApplication::find($id); return $item ? $this->success($item) : $this->fail('Application not found', 404); }
    public function update(Request $request, int $id) { $item = JobApplication::find($id); if (!$item) return $this->fail('Application not found', 404); $data = $request->validate(['status' => 'nullable|in:new,reviewing,shortlisted,rejected,hired', 'internalNotes' => 'nullable|max:10000']); if (array_key_exists('internalNotes', $data)) { $data['internal_notes'] = $data['internalNotes']; unset($data['internalNotes']); } $item->update($data); return $this->success($item->fresh(), 'Application updated'); }
    public function destroy(int $id) { $item = JobApplication::find($id); if (!$item) return $this->fail('Application not found', 404); Storage::delete('private/'.ltrim($item->cv_key, '/')); $item->delete(); return $this->success(null, 'Application deleted'); }
    public function cv(JobApplication $jobApplication) { $path = 'private/'.ltrim($jobApplication->cv_key, '/'); return Storage::exists($path) ? Storage::download($path, $jobApplication->cv_filename, ['Content-Type' => $jobApplication->cv_mime_type]) : $this->fail('CV not found', 404); }
}
