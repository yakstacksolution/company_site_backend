import express from 'express';
import { createAdmin, deleteAdmin, getAdmin, listAdmins, updateAdmin } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { adminCreateSchema, adminUpdateSchema } from '../validators/index.js';

export const adminRoutes = express.Router();

// Managing other admin accounts stays restricted to the `admin` role; editors
// may manage content but not users.
adminRoutes.use(requireAuth, requireRole('admin'));

adminRoutes.get('/', listAdmins);
adminRoutes.post('/', validate(adminCreateSchema), createAdmin);
adminRoutes.get('/:id', getAdmin);
adminRoutes.put('/:id', validate(adminUpdateSchema), updateAdmin);
adminRoutes.delete('/:id', deleteAdmin);
