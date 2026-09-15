import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileTypeFromBuffer } from 'file-type';
import { uploadDir } from '../middlewares/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import { deletePublicObject, listPublicObjects, putPublicObject, usesObjectStorage } from '../utils/objectStorage.js';

export const persistPublicUpload = async (file) => {
  if (!file) return undefined;
  const detected = await fileTypeFromBuffer(file.buffer);
  if (!detected || !detected.mime.startsWith('image/') || detected.mime !== file.mimetype) throw new Error('Uploaded image signature does not match its declared type');
  const ext = `.${detected.ext}`;
  const filename = `${path.basename(file.originalname, path.extname(file.originalname)).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48) || 'file'}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`;
  if (!usesObjectStorage()) {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), file.buffer);
    file.filename = filename;
    return `/uploads/${filename}`;
  }
  return putPublicObject({ key: `media/${filename}`, body: file.buffer, contentType: file.mimetype });
};

export const uploadImage = asyncHandler(async (req, res) => {
  const files = req.files?.length ? req.files : [req.file].filter(Boolean);

  if (files.length === 0) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const items = await Promise.all(files.map(async (file) => ({
    url: await persistPublicUpload(file),
    filename: file.filename || file.originalname,
    size: file.size,
    mimetype: file.mimetype
  })));

  // Keep `url` at the top level so existing single-upload callers keep working.
  successResponse(res, { ...items[0], items }, 'File uploaded', 201);
});

export const listUploads = asyncHandler(async (req, res) => {
  if (usesObjectStorage()) {
    const items = await listPublicObjects();
    return successResponse(res, { items, total: items.length });
  }
  let entries;
  try {
    entries = await fs.readdir(uploadDir, { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return successResponse(res, { items: [], total: 0 });
    }
    throw error;
  }

  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
      .map(async (entry) => {
        const stats = await fs.stat(path.join(uploadDir, entry.name));
        return {
          filename: entry.name,
          url: `/uploads/${entry.name}`,
          size: stats.size,
          uploadedAt: stats.mtime
        };
      })
  );

  files.sort((a, b) => b.uploadedAt - a.uploadedAt);
  successResponse(res, { items: files, total: files.length });
});

export const deleteUpload = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  if (usesObjectStorage()) {
    await deletePublicObject(filename);
    return successResponse(res, null, 'File deleted');
  }

  // Resolve and confine to the upload directory so `..` segments can't reach
  // arbitrary files on disk.
  const target = path.resolve(uploadDir, filename);
  if (path.dirname(target) !== uploadDir) {
    return res.status(400).json({ success: false, message: 'Invalid filename' });
  }

  try {
    await fs.unlink(target);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    throw error;
  }

  successResponse(res, null, 'File deleted');
});
