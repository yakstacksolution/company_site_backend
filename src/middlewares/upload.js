import multer from 'multer';
import path from 'path';

const ALLOWED_MIME = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/gif', '.gif'],
  ['image/avif', '.avif']
]);

export const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.has(file.mimetype)) {
    return cb(null, true);
  }
  return cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: ${[...ALLOWED_MIME.keys()].join(', ')}`));
};

export const upload = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
