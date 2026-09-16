<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['admin', 'editor'])->default('admin');
            $table->string('refresh_token_hash')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('icon')->nullable();
            $table->string('image')->nullable();
            $table->string('image_alt')->nullable();
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->integer('order')->default(0)->index();
            $table->json('seo')->nullable();
            $table->timestamps();
        });

        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary');
            $table->longText('description')->nullable();
            $table->string('client')->nullable();
            $table->string('industry')->nullable()->index();
            $table->json('tech_stack')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('cover_image_alt')->nullable();
            $table->json('gallery')->nullable();
            $table->boolean('is_featured')->default(false)->index();
            $table->enum('status', ['draft', 'published'])->default('draft')->index();
            $table->integer('order')->default(0)->index();
            $table->json('seo')->nullable();
            $table->timestamps();
        });

        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt');
            $table->longText('content');
            $table->string('cover_image')->nullable();
            $table->string('cover_image_alt')->nullable();
            $table->json('tags')->nullable();
            $table->string('author');
            $table->enum('status', ['draft', 'published'])->default('draft')->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->unsignedInteger('reading_minutes')->default(1);
            $table->integer('order')->default(0);
            $table->json('seo')->nullable();
            $table->timestamps();
        });

        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('title');
            $table->text('bio')->nullable();
            $table->string('photo')->nullable();
            $table->integer('order')->default(0)->index();
            $table->json('socials')->nullable();
            $table->timestamps();
        });

        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role')->nullable();
            $table->string('company')->nullable();
            $table->text('quote');
            $table->string('avatar')->nullable();
            $table->unsignedTinyInteger('rating')->default(5);
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamps();
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('logo')->nullable();
            $table->string('logo_alt')->nullable();
            $table->string('website')->nullable();
            $table->string('industry')->nullable();
            $table->string('country')->nullable();
            $table->string('summary')->nullable();
            $table->string('project_slug')->nullable();
            $table->unsignedSmallInteger('since')->nullable();
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->integer('order')->default(0)->index();
            $table->timestamps();
        });

        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('department')->nullable()->index();
            $table->string('location')->nullable();
            $table->enum('type', ['Full-time', 'Part-time', 'Contract', 'Internship'])->default('Full-time');
            $table->longText('description');
            $table->json('requirements')->nullable();
            $table->string('apply_email');
            $table->boolean('is_active')->default(true)->index();
            $table->integer('order')->default(0);
            $table->json('seo')->nullable();
            $table->timestamps();
        });

        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('subject')->nullable();
            $table->longText('message');
            $table->enum('status', ['new', 'in_progress', 'resolved'])->default('new')->index();
            $table->timestamps();
        });

        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained()->cascadeOnDelete();
            $table->string('job_title');
            $table->string('name');
            $table->string('email')->index();
            $table->string('phone')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->longText('cover_message');
            $table->string('cv_key');
            $table->string('cv_filename');
            $table->string('cv_mime_type');
            $table->timestamp('consent_at');
            $table->enum('status', ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'])->default('new')->index();
            $table->longText('internal_notes')->nullable();
            $table->timestamps();
        });

        Schema::create('website_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name')->default('Yak Stack Solution');
            $table->string('logo')->nullable();
            $table->string('favicon')->nullable();
            $table->string('primary_color')->default('#0F2B46');
            $table->string('secondary_color')->default('#F59E0B');
            $table->string('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->unsignedSmallInteger('founded_year')->default(2025);
            $table->longText('company_description')->nullable();
            $table->json('socials')->nullable();
            $table->json('seo')->nullable();
            $table->timestamps();
        });

        Schema::create('site_contents', function (Blueprint $table) {
            $table->id();
            $table->string('locale')->default('en')->unique();
            $table->boolean('is_published')->default(true);
            foreach (['navigation', 'hero', 'stats', 'sectors', 'about', 'differentiators', 'process', 'delivery', 'principles', 'sections', 'pages', 'benefits', 'contact_steps', 'contact_subjects', 'cta_assurances', 'cta', 'careers', 'footer', 'legal', 'seo'] as $column) {
                $table->json($column)->nullable();
            }
            $table->timestamps();
        });

        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('path', 500)->index();
            $table->string('referrer_host')->nullable();
            $table->enum('device', ['mobile', 'tablet', 'desktop', 'unknown'])->default('unknown');
            $table->string('visitor_hash');
            $table->timestamp('occurred_at')->index();
            $table->string('day', 10)->index();
            $table->index(['day', 'path']);
        });
    }

    public function down(): void
    {
        foreach (['analytics_events', 'site_contents', 'website_settings', 'job_applications', 'contact_messages', 'jobs', 'customers', 'testimonials', 'team_members', 'blogs', 'projects', 'services', 'admins'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
