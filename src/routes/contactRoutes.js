import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  deleteContact,
  getContact,
  listContacts,
  submitContact,
  updateContact
} from '../controllers/contactController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { contactSchema, contactUpdateSchema } from '../validators/index.js';

export const contactRoutes = express.Router();

const adminOnly = [requireAuth, requireRole('admin', 'editor')];

// The one endpoint anonymous users can write to, so it gets its own cap.
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'You have sent several messages already. Please try again later.' }
});

contactRoutes.post('/', submitLimiter, validate(contactSchema), submitContact);
contactRoutes.get('/', ...adminOnly, listContacts);
contactRoutes.get('/:id', ...adminOnly, getContact);
contactRoutes.put('/:id', ...adminOnly, validate(contactUpdateSchema), updateContact);
contactRoutes.delete('/:id', ...adminOnly, deleteContact);
