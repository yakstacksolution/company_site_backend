<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\WebsiteSettings;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Admin::query()->firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@yakstacksolution.com')],
            ['name' => env('ADMIN_NAME', 'Yak Stack Admin'), 'password' => env('ADMIN_PASSWORD', 'Admin12345'), 'role' => 'admin']
        );

        WebsiteSettings::query()->firstOrCreate([], [
            'site_name' => 'Yak Stack Solution',
            'address' => 'Madhyapur Thimi-03, Bhimsen Marg, Bhaktapur, Nepal',
            'phone' => '+977 986-8187579',
            'email' => 'yakstacksolution@gmail.com',
            'founded_year' => 2025,
            'company_description' => 'Yak Stack Solution is a software engineering company designing and building websites, mobile and desktop apps, cloud platforms and digital products for organisations worldwide.',
        ]);
    }
}
