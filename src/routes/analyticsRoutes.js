import express from 'express';
import { getAnalytics } from '../controllers/analyticsController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';

export const analyticsRoutes = express.Router();

analyticsRoutes.get('/', requireAuth, requireRole('admin', 'editor'), getAnalytics);
