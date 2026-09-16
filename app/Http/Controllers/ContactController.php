<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;
use App\Support\ApiQuery;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    use ApiResponse;
    public function store(Request $request) { $data = $request->validate(['name' => 'required|min:2', 'email' => 'required|email', 'phone' => 'nullable', 'subject' => 'nullable', 'message' => 'required|min:10|max:5000', 'honeypot' => 'nullable|max:0']); unset($data['honeypot']); $contact = ContactMessage::query()->create($data); $to = env('CONTACT_NOTIFY_EMAIL') ?: optional(\App\Models\WebsiteSettings::query()->first())->email; if ($to) { try { Mail::raw("Name: {$contact->name}\nEmail: {$contact->email}\nPhone: ".($contact->phone ?: 'not provided')."\nSubject: ".($contact->subject ?: 'not provided')."\n\n{$contact->message}", fn ($m) => $m->to($to)->replyTo($contact->email)->subject('New enquiry: '.($contact->subject ?: 'Website contact form'))); } catch (\Throwable) {} } return $this->success(['id' => $contact->id, 'name' => $contact->name], "Thanks for reaching out. We'll be in touch within one business day.", 201); }
    public function index(Request $request) { $q = ContactMessage::query(); if ($request->query('status')) $q->where('status', $request->query('status')); ApiQuery::search($q, $request->query('search'), ['name', 'email', 'subject', 'message']); ApiQuery::sort($q, $request->query('sort'), ['name', 'status', 'created_at'], ['created_at' => 'desc']); $page = ApiQuery::page($q, $request); $page['counts'] = array_merge(['new' => 0, 'in_progress' => 0, 'resolved' => 0], ContactMessage::query()->selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status')->all()); return $this->success($page); }
    public function show(int $id) { $item = ContactMessage::query()->find($id); return $item ? $this->success($item) : $this->fail('Contact not found', 404); }
    public function update(Request $request, int $id) { $item = ContactMessage::query()->find($id); if (!$item) return $this->fail('Contact not found', 404); $item->update($request->validate(['status' => 'required|in:new,in_progress,resolved'])); return $this->success($item->fresh(), 'Contact updated'); }
    public function destroy(int $id) { $item = ContactMessage::query()->find($id); if (!$item) return $this->fail('Contact not found', 404); $item->delete(); return $this->success(null, 'Contact deleted'); }
}
