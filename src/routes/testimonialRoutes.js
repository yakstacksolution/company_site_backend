import express from 'express';
import {
  createTestimonial,
  deleteTestimonial,
  getTestimonial,
  listTestimonials,
  updateTestimonial
} from '../controllers/testimonialController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { testimonialSchema, testimonialUpdateSchema } from '../validators/index.js';

export const testimonialRoutes = express.Router();

const adminOnly = [requireAuth, requireRole('admin', 'editor')];

testimonialRoutes.get('/', listTestimonials);
testimonialRoutes.get('/:id', getTestimonial);
testimonialRoutes.post('/', ...adminOnly, upload.single('avatar'), validate(testimonialSchema), createTestimonial);
testimonialRoutes.put('/:id', ...adminOnly, upload.single('avatar'), validate(testimonialUpdateSchema), updateTestimonial);
testimonialRoutes.delete('/:id', ...adminOnly, deleteTestimonial);
