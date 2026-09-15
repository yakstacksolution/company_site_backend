import express from 'express';
import { deleteUpload, listUploads, uploadImage } from '../controllers/uploadController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

export const uploadRoutes = express.Router();

uploadRoutes.use(requireAuth, requireRole('admin', 'editor'));

uploadRoutes.get('/', listUploads);
// Accepts either a single `file` or a batch under the same field name.
uploadRoutes.post('/', upload.array('file', 10), uploadImage);
uploadRoutes.delete('/:filename', deleteUpload);
