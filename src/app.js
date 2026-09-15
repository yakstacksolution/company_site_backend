import crypto from 'crypto';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFound } from './middlewares/error.js';
import { uploadDir } from './middlewares/upload.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { analyticsRoutes } from './routes/analyticsRoutes.js';
import { authRoutes } from './routes/authRoutes.js';
import { blogRoutes } from './routes/blogRoutes.js';
import { contactRoutes } from './routes/contactRoutes.js';
import { jobRoutes } from './routes/jobRoutes.js';
import { jobApplicationRoutes } from './routes/jobApplicationRoutes.js';
import { pageAnalyticsRoutes } from './routes/pageAnalyticsRoutes.js';
import { projectRoutes } from './routes/projectRoutes.js';
import { seoRoutes } from './routes/seoRoutes.js';
import { serviceRoutes } from './routes/serviceRoutes.js';
import { settingsRoutes } from './routes/settingsRoutes.js';
import { siteContentRoutes } from './routes/siteContentRoutes.js';
import { teamRoutes } from './routes/teamRoutes.js';
import { testimonialRoutes } from './routes/testimonialRoutes.js';
import { customerRoutes } from './routes/customerRoutes.js';
import { uploadRoutes } from './routes/uploadRoutes.js';

dotenv.config();

const app = express();

app.disable('x-powered-by');
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Behind a reverse proxy the rate limiter needs the forwarded IP, not the
// proxy's, or every visitor shares one bucket.
if (process.env.TRUST_PROXY === 'true') {
  app.set('trust proxy', 1);
}

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({
  // Uploaded images are served from this origin but embedded by the website and
  // admin apps on different ports.
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin/non-browser callers (curl, health checks) which send no
    // Origin header, and anything explicitly allowlisted.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' }
}));

app.use('/uploads', express.static(uploadDir, {
  maxAge: '7d',
  // Filenames are content-addressed enough to cache, but never execute or
  // inline-render anything from the upload directory.
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'");
  }
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'yak-stack-solution', uptime: process.uptime() });
});
app.get('/api/ready', (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'unavailable', database: ready ? 'connected' : 'disconnected' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/site-content', siteContentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/analytics', pageAnalyticsRoutes);
app.use('/api/uploads', uploadRoutes);

// Served at the root (not under /api) because crawlers expect them there.
app.use('/', seoRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
