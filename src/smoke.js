/**
 * End-to-end smoke test. Boots the real Express app against an in-memory
 * MongoDB, so no local database is required:
 *
 *   npm run smoke
 *
 * Exits non-zero on the first failed assertion.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'test_access_secret_value';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_value';
process.env.CORS_ORIGIN = 'http://localhost:5173';
process.env.SITE_URL = 'http://localhost:5173';
process.env.UPLOAD_DIR = 'uploads';

const results = [];
let failures = 0;

const check = (name, condition, detail = '') => {
  if (condition) {
    results.push(`  ✓ ${name}`);
  } else {
    failures += 1;
    results.push(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
};

const run = async () => {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri('yakstack_smoke');

  const { default: app } = await import('./app.js');
  const { Admin } = await import('./models/Admin.js');
  const { Blog } = await import('./models/Blog.js');
  const { Service } = await import('./models/Service.js');
  const { Job } = await import('./models/Job.js');

  await mongoose.connect(process.env.MONGO_URI);

  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;

  const call = async (method, path, { body, token, raw, cookie } = {}) => {
    const headers = {};
    if (body && !raw) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;
    if (cookie) headers.Cookie = cookie;
    const res = await fetch(`${base}${path}`, {
      method,
      headers,
      body: body ? (raw ? body : JSON.stringify(body)) : undefined
    });
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    return { status: res.status, json, text, cookie: res.headers.get('set-cookie') };
  };

  // --- fixtures -----------------------------------------------------------
  await Admin.create({
    name: 'Smoke Admin',
    email: 'smoke@yakstack.com',
    password: 'Admin@123456',
    role: 'admin'
  });
  await Blog.create({
    title: 'Published Post',
    slug: 'published-post',
    excerpt: 'A published excerpt for the smoke test.',
    content: 'Body content long enough to satisfy validation rules for the smoke test.',
    author: 'Tester',
    status: 'published',
    publishedAt: new Date()
  });
  await Blog.create({
    title: 'Secret Draft',
    slug: 'secret-draft',
    excerpt: 'A draft excerpt that must stay private.',
    content: 'Draft body content long enough to satisfy validation rules here.',
    author: 'Tester',
    status: 'draft'
  });
  await Blog.create({
    title: 'Another Published Post',
    slug: 'another-published-post',
    excerpt: 'A second published post so related-post fallback has a candidate.',
    content: 'More body content that is comfortably long enough for validation.',
    author: 'Tester',
    status: 'published',
    publishedAt: new Date()
  });
  await Service.create({
    title: 'Hidden Service',
    slug: 'hidden-service',
    description: 'An inactive service that the public must not see.',
    isActive: false
  });

  // --- health / seo -------------------------------------------------------
  const health = await call('GET', '/api/health');
  check('health returns ok', health.status === 200 && health.json?.status === 'ok');

  const robots = await call('GET', '/robots.txt');
  check('robots.txt serves sitemap reference', robots.status === 200 && robots.text.includes('sitemap.xml'));

  const sitemap = await call('GET', '/sitemap.xml');
  check(
    'sitemap lists published post only',
    sitemap.status === 200 &&
      sitemap.text.includes('/blog/published-post') &&
      !sitemap.text.includes('secret-draft'),
    'draft leaked into sitemap'
  );

  // --- auth ---------------------------------------------------------------
  const badLogin = await call('POST', '/api/auth/login', {
    body: { email: 'smoke@yakstack.com', password: 'wrong-password' }
  });
  check('wrong password rejected', badLogin.status === 401);

  const invalidLogin = await call('POST', '/api/auth/login', { body: { email: 'not-an-email' } });
  check('malformed login rejected with 422', invalidLogin.status === 422, `got ${invalidLogin.status}`);

  const login = await call('POST', '/api/auth/login', {
    body: { email: 'smoke@yakstack.com', password: 'Admin@123456' }
  });
  check('login succeeds', login.status === 200 && Boolean(login.json?.data?.accessToken));
  const token = login.json?.data?.accessToken;
  const refreshCookie = login.cookie?.split(';')[0];
  check('refresh token is issued as HttpOnly cookie', Boolean(login.cookie?.includes('HttpOnly')) && !login.json?.data?.refreshToken);

  const me = await call('GET', '/api/auth/me', { token });
  check('auth/me returns the admin', me.status === 200 && me.json?.data?.email === 'smoke@yakstack.com');

  const rotated = await call('POST', '/api/auth/refresh', { body: {}, cookie: refreshCookie });
  check('refresh rotates the cookie', rotated.status === 200 && rotated.cookie?.split(';')[0] !== refreshCookie);

  const replay = await call('POST', '/api/auth/refresh', { body: {}, cookie: refreshCookie });
  check('old refresh token is rejected after rotation', replay.status === 401, `got ${replay.status}`);

  // --- public/private scoping (the draft-leak fix) ------------------------
  const publicBlogs = await call('GET', '/api/blogs');
  const publicSlugs = (publicBlogs.json?.data?.items || []).map((item) => item.slug);
  check(
    'anonymous blog list excludes drafts',
    publicBlogs.status === 200 && publicSlugs.includes('published-post') && !publicSlugs.includes('secret-draft'),
    `saw ${JSON.stringify(publicSlugs)}`
  );

  const forcedDraft = await call('GET', '/api/blogs?status=draft');
  const forcedSlugs = (forcedDraft.json?.data?.items || []).map((item) => item.slug);
  check(
    'anonymous cannot force ?status=draft',
    !forcedSlugs.includes('secret-draft'),
    `saw ${JSON.stringify(forcedSlugs)}`
  );

  const draftBySlug = await call('GET', '/api/blogs/slug/secret-draft');
  check('anonymous draft detail returns 404', draftBySlug.status === 404, `got ${draftBySlug.status}`);

  const adminBlogs = await call('GET', '/api/blogs?status=draft', { token });
  const adminSlugs = (adminBlogs.json?.data?.items || []).map((item) => item.slug);
  check('admin can list drafts', adminSlugs.includes('secret-draft'), `saw ${JSON.stringify(adminSlugs)}`);

  const adminDraft = await call('GET', '/api/blogs/slug/secret-draft', { token });
  check('admin can read a draft by slug', adminDraft.status === 200 && Boolean(adminDraft.json?.data?.blog));

  const publicServices = await call('GET', '/api/services');
  const serviceSlugs = (publicServices.json?.data?.items || []).map((item) => item.slug);
  check('inactive services hidden from public', !serviceSlugs.includes('hidden-service'));

  // --- dynamic site content, analytics and applications ------------------
  const content = await call('GET', '/api/site-content');
  check('site content exposes hero defaults', content.status === 200 && Boolean(content.json?.data?.hero?.lead));
  const updatedContent = await call('PUT', '/api/site-content', { token, body: { hero: { headline: 'Updated from the CMS' } } });
  check('staff can update structured site content', updatedContent.status === 200 && updatedContent.json?.data?.hero?.headline === 'Updated from the CMS');

  const event = await call('POST', '/api/analytics/events', { body: { path: '/services', referrer: 'https://example.com/search' } });
  check('anonymous page view accepted without cookies', event.status === 204);
  const pageAnalytics = await call('GET', '/api/analytics/pages', { token });
  check('staff analytics are aggregated', pageAnalytics.status === 200 && pageAnalytics.json?.data?.views === 1);

  const role = await Job.create({ title: 'Test Engineer', slug: 'test-engineer', description: 'A real open role used for application testing.', applyEmail: 'jobs@yakstack.com', isActive: true });
  const applicationForm = new FormData();
  applicationForm.append('jobId', String(role._id));
  applicationForm.append('name', 'Applicant Person');
  applicationForm.append('email', 'applicant@example.com');
  applicationForm.append('coverMessage', 'I would like to contribute careful engineering work to this role.');
  applicationForm.append('consent', 'true');
  applicationForm.append('honeypot', '');
  applicationForm.append('cv', new Blob([Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF')], { type: 'application/pdf' }), 'resume.pdf');
  const application = await call('POST', '/api/job-applications', { body: applicationForm, raw: true });
  check('job application with genuine PDF is persisted', application.status === 201 && application.json?.data?.status === 'new');
  check('private storage key never reaches public response', !application.json?.data?.cvKey);
  const applications = await call('GET', '/api/job-applications', { token });
  const applicationId = applications.json?.data?.items?.[0]?._id;
  check('staff can list applications', applications.status === 200 && Boolean(applicationId));
  const advanced = await call('PUT', `/api/job-applications/${applicationId}`, { token, body: { status: 'reviewing', internalNotes: 'Initial review complete.' } });
  check('staff can advance application workflow', advanced.status === 200 && advanced.json?.data?.status === 'reviewing');

  // --- slug routing ------------------------------------------------------
  const bySlug = await call('GET', '/api/blogs/slug/published-post');
  check(
    'blog slug endpoint returns post plus related',
    bySlug.status === 200 &&
      bySlug.json?.data?.blog?.slug === 'published-post' &&
      Array.isArray(bySlug.json?.data?.related)
  );
  check('reading time computed on save', bySlug.json?.data?.blog?.readingMinutes >= 1);

  // --- authorization -----------------------------------------------------
  const unauth = await call('POST', '/api/services', { body: { title: 'Nope', description: 'Should not be created.' } });
  check('unauthenticated create rejected', unauth.status === 401);

  const badToken = await call('GET', '/api/analytics', { token: 'not-a-real-token' });
  check('garbage token rejected', badToken.status === 401);

  // --- validation & CRUD -------------------------------------------------
  const invalidService = await call('POST', '/api/services', { token, body: { title: 'x' } });
  check('short title rejected with field errors', invalidService.status === 422 && invalidService.json?.errors?.length > 0);

  const created = await call('POST', '/api/services', {
    token,
    body: {
      title: 'Managed Kubernetes',
      description: 'A description that comfortably clears the minimum length rule.',
      features: 'clusters, scaling, monitoring',
      isActive: 'true',
      order: '2'
    }
  });
  check('service created with generated slug', created.status === 201 && created.json?.data?.slug === 'managed-kubernetes');
  check(
    'comma-separated features coerced to array',
    Array.isArray(created.json?.data?.features) && created.json.data.features.length === 3,
    JSON.stringify(created.json?.data?.features)
  );
  check('boolean and number strings coerced', created.json?.data?.isActive === true && created.json?.data?.order === 2);

  const duplicate = await call('POST', '/api/services', {
    token,
    body: { title: 'Managed Kubernetes', description: 'Another description clearing the length rule.' }
  });
  check(
    'duplicate title gets a distinct slug',
    duplicate.status === 201 && duplicate.json?.data?.slug === 'managed-kubernetes-2',
    duplicate.json?.data?.slug
  );

  const updated = await call('PUT', `/api/services/${created.json.data._id}`, {
    token,
    body: { description: 'An updated description that still clears the minimum length.' }
  });
  check('partial update accepted', updated.status === 200 && updated.json?.data?.title === 'Managed Kubernetes');

  const castError = await call('GET', '/api/services/not-a-valid-id');
  check('invalid ObjectId returns 400 not 500', castError.status === 400, `got ${castError.status}`);

  const missing = await call('GET', '/api/services/507f1f77bcf86cd799439011');
  check('unknown id returns 404', missing.status === 404);

  const removed = await call('DELETE', `/api/services/${created.json.data._id}`, { token });
  check('service deleted', removed.status === 200);

  // --- nested settings merge ---------------------------------------------
  await call('PUT', '/api/settings', {
    token,
    body: { siteName: 'Yak Stack', socials: { linkedin: 'https://linkedin.com/company/x' } }
  });
  const merged = await call('PUT', '/api/settings', { token, body: { socials: { github: 'https://github.com/x' } } });
  check(
    'nested settings merge preserves untouched keys',
    merged.json?.data?.socials?.linkedin === 'https://linkedin.com/company/x' &&
      merged.json?.data?.socials?.github === 'https://github.com/x',
    JSON.stringify(merged.json?.data?.socials)
  );

  // --- contact form ------------------------------------------------------
  const contact = await call('POST', '/api/contacts', {
    body: {
      name: 'Smoke Tester',
      email: 'tester@example.com',
      message: 'This enquiry is long enough to pass validation checks.'
    }
  });
  check('contact submission accepted', contact.status === 201);
  check('contact response does not echo the full record', !contact.json?.data?.message);

  const spam = await call('POST', '/api/contacts', {
    body: {
      name: 'Spam Bot',
      email: 'bot@example.com',
      message: 'This enquiry is long enough to pass validation checks.',
      honeypot: 'gotcha'
    }
  });
  check('honeypot submission rejected', spam.status === 422, `got ${spam.status}`);

  const leadsAnon = await call('GET', '/api/contacts');
  check('contact list requires auth', leadsAnon.status === 401);

  const leads = await call('GET', '/api/contacts', { token });
  check('admin lead list includes status counts', leads.status === 200 && Boolean(leads.json?.data?.counts));

  // --- analytics & media -------------------------------------------------
  const analytics = await call('GET', '/api/analytics', { token });
  check(
    'analytics returns a 6-month timeline',
    analytics.status === 200 && analytics.json?.data?.timeline?.length === 6
  );
  check('analytics splits draft vs published', analytics.json?.data?.draftBlogCount === 1);

  const media = await call('GET', '/api/uploads', { token });
  check('media library lists uploads', media.status === 200 && Array.isArray(media.json?.data?.items));

  const traversal = await call('DELETE', '/api/uploads/..%2F..%2Fpackage.json', { token });
  check('path traversal on delete blocked', traversal.status === 400 || traversal.status === 404, `got ${traversal.status}`);

  // --- admin user guards -------------------------------------------------
  const selfDelete = await call('DELETE', `/api/admins/${login.json.data.admin.id}`, { token });
  check('cannot delete own account', selfDelete.status === 400, `got ${selfDelete.status}`);

  const weakPassword = await call('POST', '/api/admins', {
    token,
    body: { name: 'Weak', email: 'weak@yakstack.com', password: 'short' }
  });
  check('weak admin password rejected', weakPassword.status === 422);

  // --- role gating: editors manage content, not users or settings ---------
  await Admin.create({
    name: 'Smoke Editor',
    email: 'editor@yakstack.com',
    password: 'Editor@123456',
    role: 'editor'
  });
  const editorLogin = await call('POST', '/api/auth/login', {
    body: { email: 'editor@yakstack.com', password: 'Editor@123456' }
  });
  const editorToken = editorLogin.json?.data?.accessToken;
  check('editor can sign in', editorLogin.status === 200 && Boolean(editorToken));

  const editorUsers = await call('GET', '/api/admins', { token: editorToken });
  check('editor cannot manage users', editorUsers.status === 403, `got ${editorUsers.status}`);

  const editorSettings = await call('PUT', '/api/settings', { token: editorToken, body: { siteName: 'Nope' } });
  check('editor cannot change site settings', editorSettings.status === 403, `got ${editorSettings.status}`);

  const editorContent = await call('POST', '/api/services', {
    token: editorToken,
    body: { title: 'Editor Service', description: 'Editors are allowed to manage content records.' }
  });
  check('editor can manage content', editorContent.status === 201, `got ${editorContent.status}`);

  // --- multipart upload path used by the admin forms ----------------------
  // Smallest valid PNG, so multer's mime sniffing has something real to read.
  const png = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6300010000050001',
    'hex'
  );
  const form = new FormData();
  form.append('title', 'Multipart Project');
  form.append('summary', 'Created through the multipart path with a cover image attached.');
  form.append('techStack', 'React, Node.js');
  form.append('isFeatured', 'true');
  form.append('coverImage', new Blob([png], { type: 'image/png' }), 'cover.png');

  const uploaded = await fetch(`${base}/api/projects`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  const uploadedJson = await uploaded.json();
  const created2 = uploadedJson?.data;
  check('multipart create succeeds', uploaded.status === 201, `got ${uploaded.status}`);
  check('cover image path stored', Boolean(created2?.coverImage?.startsWith('/uploads/')), created2?.coverImage);
  check(
    'upload does not duplicate the file extension',
    Boolean(created2?.coverImage) && !created2.coverImage.includes('.png.png'),
    created2?.coverImage
  );
  check('csv field parsed into an array', Array.isArray(created2?.techStack) && created2.techStack.length === 2);
  check('boolean string coerced on multipart', created2?.isFeatured === true);

  const library = await call('GET', '/api/uploads', { token });
  const libraryItems = library.json?.data?.items || [];
  const stored = libraryItems.find((item) => item.url === created2?.coverImage);
  check('uploaded file appears in the media library', Boolean(stored));
  check('media entries carry size and timestamp', Boolean(stored?.size > 0 && stored?.uploadedAt));

  if (stored) {
    const removedFile = await call('DELETE', `/api/uploads/${stored.filename}`, { token });
    check('media file deleted', removedFile.status === 200);
  }

  const unsafeSearch = await call('GET', '/api/services?search=%2A%2A%2A');
  check('regex metacharacters in search are escaped', unsafeSearch.status === 200, `got ${unsafeSearch.status}`);

  const relatedFallback = await call('GET', '/api/blogs/slug/published-post');
  check(
    'related posts fall back to recent when tags do not overlap',
    (relatedFallback.json?.data?.related || []).length > 0
  );

  const notFoundRoute = await call('GET', '/api/nope');
  check('unknown route returns 404 json', notFoundRoute.status === 404 && notFoundRoute.json?.success === false);

  // --- report ------------------------------------------------------------
  server.close();
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongo.stop();

  /* eslint-disable no-console */
  console.log('\nBackend smoke test\n');
  console.log(results.join('\n'));
  console.log(`\n${results.length - failures}/${results.length} checks passed\n`);
  /* eslint-enable no-console */

  process.exit(failures > 0 ? 1 : 0);
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
