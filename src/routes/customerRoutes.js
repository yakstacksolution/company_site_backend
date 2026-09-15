import express from 'express';
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer
} from '../controllers/customerController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { customerSchema, customerUpdateSchema } from '../validators/index.js';

export const customerRoutes = express.Router();

const adminOnly = [requireAuth, requireRole('admin', 'editor')];

customerRoutes.get('/', listCustomers);
customerRoutes.get('/:id', getCustomer);
customerRoutes.post('/', ...adminOnly, upload.single('logo'), validate(customerSchema), createCustomer);
customerRoutes.put('/:id', ...adminOnly, upload.single('logo'), validate(customerUpdateSchema), updateCustomer);
customerRoutes.delete('/:id', ...adminOnly, deleteCustomer);
