import { Admin } from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPagination } from '../utils/pagination.js';
import { buildSearch } from '../utils/query.js';
import { successResponse } from '../utils/response.js';

const notFound = (res) => res.status(404).json({ success: false, message: 'Admin not found' });

export const listAdmins = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = buildSearch(req.query.search, ['name', 'email']) || {};

  const [items, total] = await Promise.all([
    Admin.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }).select('-password'),
    Admin.countDocuments(filter)
  ]);

  successResponse(res, { items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const getAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id).select('-password');
  if (!admin) return notFound(res);
  successResponse(res, admin);
});

export const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (await Admin.exists({ email })) {
    return res.status(409).json({ success: false, message: 'An account with that email already exists' });
  }

  const admin = await Admin.create({ name, email, password, role });
  successResponse(
    res,
    { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    'Admin created',
    201
  );
});

export const updateAdmin = asyncHandler(async (req, res) => {
  // Loaded as a document (not findByIdAndUpdate) so the pre-save hook hashes a
  // new password instead of storing it in plaintext.
  const admin = await Admin.findById(req.params.id).select('+password');
  if (!admin) return notFound(res);

  const { name, email, password, role } = req.body;

  if (email && email !== admin.email && (await Admin.exists({ email }))) {
    return res.status(409).json({ success: false, message: 'An account with that email already exists' });
  }

  // Don't let the last admin demote themselves out of user management.
  if (role && role !== 'admin' && admin.role === 'admin') {
    const admins = await Admin.countDocuments({ role: 'admin' });
    if (admins <= 1) {
      return res.status(400).json({ success: false, message: 'At least one admin account must remain' });
    }
  }

  if (name) admin.name = name;
  if (email) admin.email = email;
  if (password) admin.password = password;
  if (role) admin.role = role;
  await admin.save();

  successResponse(
    res,
    { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    'Admin updated'
  );
});

export const deleteAdmin = asyncHandler(async (req, res) => {
  if (req.params.id === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
  }

  const admin = await Admin.findById(req.params.id);
  if (!admin) return notFound(res);

  // Deleting the only admin would lock everyone out of the dashboard.
  if (admin.role === 'admin' && (await Admin.countDocuments({ role: 'admin' })) <= 1) {
    return res.status(400).json({ success: false, message: 'At least one admin account must remain' });
  }

  await admin.deleteOne();
  successResponse(res, null, 'Admin deleted');
});
