import express from 'express';
import {
  createBlog,
  deleteBlog,
  getBlog,
  getBlogBySlug,
  listBlogTags,
  listBlogs,
  updateBlog
} from '../controllers/blogController.js';
import { optionalAuth, requireAuth, requireRole } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { blogSchema, blogUpdateSchema } from '../validators/index.js';

export const blogRoutes = express.Router();

const adminOnly = [requireAuth, requireRole('admin', 'editor')];

// `optionalAuth` lets the controller show drafts to a signed-in admin while
// anonymous callers only ever receive published posts.
blogRoutes.get('/', optionalAuth, listBlogs);
blogRoutes.get('/tags', optionalAuth, listBlogTags);
blogRoutes.get('/slug/:slug', optionalAuth, getBlogBySlug);
blogRoutes.get('/:id', optionalAuth, getBlog);
blogRoutes.post('/', ...adminOnly, upload.single('coverImage'), validate(blogSchema), createBlog);
blogRoutes.put('/:id', ...adminOnly, upload.single('coverImage'), validate(blogUpdateSchema), updateBlog);
blogRoutes.delete('/:id', ...adminOnly, deleteBlog);
