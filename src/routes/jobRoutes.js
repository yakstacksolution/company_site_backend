import express from 'express';
import {
  createJob,
  deleteJob,
  getJob,
  getJobBySlug,
  listJobDepartments,
  listJobs,
  updateJob
} from '../controllers/jobController.js';
import { optionalAuth, requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { jobSchema, jobUpdateSchema } from '../validators/index.js';

export const jobRoutes = express.Router();

const adminOnly = [requireAuth, requireRole('admin', 'editor')];

jobRoutes.get('/', optionalAuth, listJobs);
jobRoutes.get('/departments', optionalAuth, listJobDepartments);
jobRoutes.get('/slug/:slug', optionalAuth, getJobBySlug);
jobRoutes.get('/:id', optionalAuth, getJob);
jobRoutes.post('/', ...adminOnly, validate(jobSchema), createJob);
jobRoutes.put('/:id', ...adminOnly, validate(jobUpdateSchema), updateJob);
jobRoutes.delete('/:id', ...adminOnly, deleteJob);
