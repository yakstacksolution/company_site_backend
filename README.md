# Yak Stack Solution Backend

Laravel SQL API for the Yak Stack Solution company site.

## Local development

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Health endpoints:

- `/api/health`
- `/api/ready`

The API includes auth, admins, services, projects, blogs, team, testimonials, customers, jobs, job applications, contacts, settings, site content, uploads, analytics, sitemap, and robots.
