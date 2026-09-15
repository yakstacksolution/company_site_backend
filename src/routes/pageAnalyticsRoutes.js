import express from 'express';
import rateLimit from 'express-rate-limit';
import { getPageAnalytics, recordPageView } from '../controllers/pageAnalyticsController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { analyticsEventSchema } from '../validators/index.js';

export const pageAnalyticsRoutes = express.Router();
const eventLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });
pageAnalyticsRoutes.post('/events', eventLimiter, validate(analyticsEventSchema), recordPageView);
pageAnalyticsRoutes.get('/pages', requireAuth, requireRole('admin', 'editor'), getPageAnalytics);
