import express from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import {
  createJobApplication, deleteJobApplication, downloadJobApplicationCv,
  getJobApplication, listJobApplications, updateJobApplication
} from '../controllers/jobApplicationController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { jobApplicationSchema, jobApplicationUpdateSchema } from '../validators/index.js';

export const jobApplicationRoutes = express.Router();
const staff = [requireAuth, requireRole('admin', 'editor')];
const cvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
const applicationLimiter = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false, message: { success: false, message: 'Too many applications from this connection. Try again later.' } });

jobApplicationRoutes.post('/', applicationLimiter, cvUpload.single('cv'), validate(jobApplicationSchema), createJobApplication);
jobApplicationRoutes.get('/', ...staff, listJobApplications);
jobApplicationRoutes.get('/:id', ...staff, getJobApplication);
jobApplicationRoutes.get('/:id/cv', ...staff, downloadJobApplicationCv);
jobApplicationRoutes.put('/:id', ...staff, validate(jobApplicationUpdateSchema), updateJobApplication);
jobApplicationRoutes.delete('/:id', ...staff, deleteJobApplication);
