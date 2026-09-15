import express from 'express';
import {
  createProject,
  deleteProject,
  getProject,
  getProjectBySlug,
  listProjectIndustries,
  listProjects,
  updateProject
} from '../controllers/projectController.js';
import { optionalAuth, requireAuth, requireRole } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { projectSchema, projectUpdateSchema } from '../validators/index.js';

export const projectRoutes = express.Router();

const adminOnly = [requireAuth, requireRole('admin', 'editor')];

projectRoutes.get('/', optionalAuth, listProjects);
projectRoutes.get('/industries', listProjectIndustries);
projectRoutes.get('/slug/:slug', optionalAuth, getProjectBySlug);
projectRoutes.get('/:id', optionalAuth, getProject);
projectRoutes.post('/', ...adminOnly, upload.single('coverImage'), validate(projectSchema), createProject);
projectRoutes.put('/:id', ...adminOnly, upload.single('coverImage'), validate(projectUpdateSchema), updateProject);
projectRoutes.delete('/:id', ...adminOnly, deleteProject);
