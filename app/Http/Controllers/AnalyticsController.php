<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\Blog;
use App\Models\ContactMessage;
use App\Models\Job;
use App\Models\JobApplication;
use App\Models\Project;
use App\Models\Service;
use App\Models\TeamMember;
use App\Models\Testimonial;
use App\Support\ApiResponse;

class AnalyticsController extends Controller
{
    use ApiResponse;
    public function index() { $blogCount = Blog::count(); $publishedBlogCount = Blog::where('status', 'published')->count(); $contactCount = ContactMessage::count(); $newContacts = ContactMessage::where('status', 'new')->count(); $resolvedContacts = ContactMessage::where('status', 'resolved')->count(); return $this->success(['adminCount' => Admin::count(), 'serviceCount' => Service::count(), 'projectCount' => Project::count(), 'blogCount' => $blogCount, 'publishedBlogCount' => $publishedBlogCount, 'draftBlogCount' => $blogCount - $publishedBlogCount, 'teamCount' => TeamMember::count(), 'testimonialCount' => Testimonial::count(), 'jobCount' => Job::count(), 'openJobCount' => Job::where('is_active', true)->count(), 'contactCount' => $contactCount, 'newContacts' => $newContacts, 'resolvedContacts' => $resolvedContacts, 'inProgressContacts' => $contactCount - $newContacts - $resolvedContacts, 'timeline' => [], 'recentContacts' => ContactMessage::latest()->take(5)->get(), 'recentBlogs' => Blog::latest()->take(5)->get(), 'applicationCount' => JobApplication::count(), 'newApplications' => JobApplication::where('status', 'new')->count(), 'recentApplications' => JobApplication::latest()->take(5)->get()]); }
}
