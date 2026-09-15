import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { settingsSchema } from '../validators/index.js';

export const settingsRoutes = express.Router();

settingsRoutes.get('/', getSettings);
settingsRoutes.put('/', requireAuth, requireRole('admin'), validate(settingsSchema), updateSettings);
