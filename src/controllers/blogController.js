import { Blog } from '../models/Blog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPagination } from '../utils/pagination.js';
import { buildSearch, buildSort, isAdmin } from '../utils/query.js';
import { successResponse } from '../utils/response.js';
import { uniqueSlug } from '../utils/slug.js';
import { persistPublicUpload } from './uploadController.js';

const notFound = (res) => res.status(404).json({ success: false, message: 'Blog not found' });

export const listBlogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};

  // Drafts are editorial content and must never reach the public site. Only an
  // authenticated admin may filter by status or see anything unpublished.
  if (isAdmin(req)) {
    if (req.query.status) {
      filter.status = req.query.status;
    }
  } else {
    filter.status = 'published';
  }

  if (req.query.tag) {
    filter.tags = req.query.tag;
  }

  const search = buildSearch(req.query.search, ['title', 'excerpt', 'author']);
  if (search) {
    Object.assign(filter, search);
  }

  const sort = buildSort(req.query.sort, ['publishedAt', 'title', 'createdAt'], {
    publishedAt: -1,
    createdAt: -1
  });

  const [items, total] = await Promise.all([
    // The body is large and unused in list views; omit it to keep payloads small.
    Blog.find(filter).select('-content').skip(skip).limit(limit).sort(sort),
    Blog.countDocuments(filter)
  ]);

  successResponse(res, { items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const listBlogTags = asyncHandler(async (req, res) => {
  const filter = isAdmin(req) ? {} : { status: 'published' };
  const tags = await Blog.distinct('tags', filter);
  successResponse(res, { items: tags.filter(Boolean).sort() });
});

export const getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ _id: req.params.id, ...(isAdmin(req) ? {} : { status: 'published' }) });
  if (!blog) return notFound(res);
  successResponse(res, blog);
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const filter = { slug: req.params.slug };
  if (!isAdmin(req)) {
    filter.status = 'published';
  }

  const blog = await Blog.findOne(filter);
  if (!blog) return notFound(res);

  // Surface a couple of sibling posts so the article page can suggest more
  // reading without a second round trip.
  const RELATED_LIMIT = 3;
  const fields = 'title slug excerpt coverImage tags author publishedAt readingMinutes';

  let related = [];
  if (blog.tags?.length) {
    related = await Blog.find({
      _id: { $ne: blog._id },
      status: 'published',
      tags: { $in: blog.tags }
    })
      .select(fields)
      .sort({ publishedAt: -1 })
      .limit(RELATED_LIMIT);
  }

  // Tag overlap is often empty on a small blog, which left the "Keep reading"
  // section blank. Top up with the most recent other posts.
  if (related.length < RELATED_LIMIT) {
    const exclude = [blog._id, ...related.map((item) => item._id)];
    const filler = await Blog.find({ _id: { $nin: exclude }, status: 'published' })
      .select(fields)
      .sort({ publishedAt: -1 })
      .limit(RELATED_LIMIT - related.length);
    related = [...related, ...filler];
  }

  successResponse(res, { blog, related });
});

const applyPublishState = (payload, existing = null) => {
  if (payload.status === 'published' && !payload.publishedAt && !existing?.publishedAt) {
    payload.publishedAt = new Date();
  }
  if (payload.status === 'draft') {
    payload.publishedAt = null;
  }
};

export const createBlog = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.slug = payload.slug || (await uniqueSlug(Blog, payload.title));
  applyPublishState(payload);
  if (req.file) {
    payload.coverImage = await persistPublicUpload(req.file);
  }
  const blog = await Blog.create(payload);
  successResponse(res, blog, 'Blog created', 201);
});

export const updateBlog = asyncHandler(async (req, res) => {
  const existing = await Blog.findById(req.params.id);
  if (!existing) return notFound(res);

  const payload = { ...req.body };
  if (payload.title && !payload.slug) {
    payload.slug = await uniqueSlug(Blog, payload.title, req.params.id);
  }
  applyPublishState(payload, existing);
  if (req.file) {
    payload.coverImage = await persistPublicUpload(req.file);
  }

  const blog = await Blog.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });
  successResponse(res, blog, 'Blog updated');
});

export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) return notFound(res);
  successResponse(res, null, 'Blog deleted');
});
