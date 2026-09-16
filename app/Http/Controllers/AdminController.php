<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Support\ApiQuery;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    use ApiResponse;

    public function index(Request $request) { $q = Admin::query(); ApiQuery::search($q, $request->query('search'), ['name', 'email']); $q->latest(); return $this->success(ApiQuery::page($q, $request)); }
    public function show(int $id) { $admin = Admin::query()->find($id); return $admin ? $this->success($admin) : $this->fail('Admin not found', 404); }
    public function store(Request $request) { $data = $request->validate(['name' => 'required|min:2', 'email' => 'required|email|unique:admins,email', 'password' => ['required', 'min:8', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/'], 'role' => 'nullable|in:admin,editor']); $admin = Admin::query()->create($data); return $this->success($admin, 'Admin created', 201); }
    public function update(Request $request, int $id) { $admin = Admin::query()->find($id); if (!$admin) return $this->fail('Admin not found', 404); $data = $request->validate(['name' => 'sometimes|min:2', 'email' => "sometimes|email|unique:admins,email,$id", 'password' => ['sometimes', 'min:8', 'regex:/[a-z]/', 'regex:/[A-Z]/', 'regex:/[0-9]/'], 'role' => 'sometimes|in:admin,editor']); if (($data['role'] ?? null) !== 'admin' && $admin->role === 'admin' && Admin::query()->where('role', 'admin')->count() <= 1) return $this->fail('At least one admin account must remain', 400); $admin->fill($data)->save(); return $this->success($admin->fresh(), 'Admin updated'); }
    public function destroy(Request $request, int $id) { if ($request->attributes->get('admin_user')?->id === $id) return $this->fail('You cannot delete your own account', 400); $admin = Admin::query()->find($id); if (!$admin) return $this->fail('Admin not found', 404); if ($admin->role === 'admin' && Admin::query()->where('role', 'admin')->count() <= 1) return $this->fail('At least one admin account must remain', 400); $admin->delete(); return $this->success(null, 'Admin deleted'); }
}
