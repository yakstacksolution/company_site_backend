<?php

namespace App\Http\Controllers;

use App\Models\WebsiteSettings;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    use ApiResponse;
    private function load(): WebsiteSettings { return WebsiteSettings::query()->firstOrCreate([], ['address' => 'Madhyapur Thimi-03, Bhimsen Marg, Bhaktapur, Nepal', 'phone' => '+977 986-8187579', 'email' => 'yakstacksolution@gmail.com', 'company_description' => 'Yak Stack Solution is a software engineering company designing and building websites, mobile and desktop apps, cloud platforms and digital products for organisations worldwide.']); }
    public function show() { return $this->success($this->load()); }
    public function update(Request $request) { $settings = $this->load(); $settings->fill(collect($request->all())->mapWithKeys(fn ($v, $k) => [str()->snake($k)->toString() => $v])->all())->save(); return $this->success($settings->fresh(), 'Settings updated'); }
}
