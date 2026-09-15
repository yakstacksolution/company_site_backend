import express from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, me, refreshToken } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { loginSchema, logoutSchema, refreshSchema } from '../validators/index.js';

export const authRoutes = express.Router();

const trustedOrigin = (req, res, next) => {
  const origin = req.headers.origin;
  const allowed = (process.env.CORS_ORIGIN || '').split(',').map((item) => item.trim());
  if (origin && !allowed.includes(origin)) return res.status(403).json({ success: false, message: 'Untrusted origin' });
  return next();
};

// Much tighter than the global limiter: credential endpoints are the ones worth
// brute-forcing, so they get their own budget per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' }
});

authRoutes.post('/login', authLimiter, validate(loginSchema), login);
authRoutes.post('/refresh', trustedOrigin, validate(refreshSchema), refreshToken);
authRoutes.post('/logout', trustedOrigin, validate(logoutSchema), logout);
authRoutes.get('/me', requireAuth, me);
