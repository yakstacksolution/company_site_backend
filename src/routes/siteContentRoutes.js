import express from 'express';
import { getSiteContent, updateSiteContent } from '../controllers/siteContentController.js';
import { optionalAuth, requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { siteContentSchema } from '../validators/index.js';

export const siteContentRoutes = express.Router();
siteContentRoutes.get('/', optionalAuth, getSiteContent);
siteContentRoutes.put('/', requireAuth, requireRole('admin', 'editor'), validate(siteContentSchema), updateSiteContent);
