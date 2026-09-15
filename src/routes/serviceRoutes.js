import express from 'express';
import {
  createService,
  deleteService,
  getService,
  getServiceBySlug,
  listServices,
  updateService
} from '../controllers/serviceController.js';
import { optionalAuth, requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { serviceSchema, serviceUpdateSchema } from '../validators/index.js';

export const serviceRoutes = express.Router();

const adminOnly = [requireAuth, requireRole('admin', 'editor')];

serviceRoutes.get('/', optionalAuth, listServices);
// Registered before `/:id` so a slug is never parsed as an ObjectId.
serviceRoutes.get('/slug/:slug', optionalAuth, getServiceBySlug);
serviceRoutes.get('/:id', optionalAuth, getService);
serviceRoutes.post('/', ...adminOnly, validate(serviceSchema), createService);
serviceRoutes.put('/:id', ...adminOnly, validate(serviceUpdateSchema), updateService);
serviceRoutes.delete('/:id', ...adminOnly, deleteService);
