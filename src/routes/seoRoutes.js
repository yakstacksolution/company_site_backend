import express from 'express';
import { Blog } from '../models/Blog.js';
import { Job } from '../models/Job.js';
import { Project } from '../models/Project.js';
import { Service } from '../models/Service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const seoRoutes = express.Router();

const STATIC_PATHS = ['/', '/about', '/services', '/projects', '/blog', '/careers', '/contact', '/privacy', '/terms'];

const siteUrl = () => (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/, '');

const urlEntry = ({ loc, lastmod, priority }) =>
  [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${new Date(lastmod).toISOString().slice(0, 10)}</lastmod>` : null,
    `    <priority>${priority}</priority>`,
    '  </url>'
  ]
    .filter(Boolean)
    .join('\n');

/**
 * Generated from live content so newly published posts and projects are
 * discoverable without a rebuild. Only public, published records are listed.
 */
seoRoutes.get('/sitemap.xml', asyncHandler(async (req, res) => {
  const base = siteUrl();

  const [blogs, projects, services, jobs] = await Promise.all([
    Blog.find({ status: 'published' }).select('slug updatedAt').sort({ publishedAt: -1 }),
    Project.find({ status: 'published' }).select('slug updatedAt'),
    Service.find({ isActive: true }).select('slug updatedAt'),
    Job.find({ isActive: true }).select('slug updatedAt')
  ]);

  const entries = [
    ...STATIC_PATHS.map((path) => ({ loc: `${base}${path}`, priority: path === '/' ? '1.0' : '0.8' })),
    ...services.map((item) => ({ loc: `${base}/services/${item.slug}`, lastmod: item.updatedAt, priority: '0.7' })),
    ...projects.map((item) => ({ loc: `${base}/projects/${item.slug}`, lastmod: item.updatedAt, priority: '0.7' })),
    ...blogs.map((item) => ({ loc: `${base}/blog/${item.slug}`, lastmod: item.updatedAt, priority: '0.6' })),
    ...jobs.map((item) => ({ loc: `${base}/careers/${item.slug}`, lastmod: item.updatedAt, priority: '0.5' }))
  ];

  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
      .map(urlEntry)
      .join('\n')}\n</urlset>\n`
  );
}));

seoRoutes.get('/robots.txt', (req, res) => {
  res.type('text/plain').send([`User-agent: *`, 'Allow: /', '', `Sitemap: ${siteUrl()}/sitemap.xml`, ''].join('\n'));
});
