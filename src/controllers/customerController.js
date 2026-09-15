import { Customer } from '../models/Customer.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPagination } from '../utils/pagination.js';
import { buildSearch, buildSort } from '../utils/query.js';
import { successResponse } from '../utils/response.js';
import { persistPublicUpload } from './uploadController.js';

const notFound = (res) => res.status(404).json({ success: false, message: 'Customer not found' });

export const listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};

  if (req.query.active !== undefined) {
    filter.isActive = req.query.active === 'true';
  }
  if (req.query.featured !== undefined) {
    filter.isFeatured = req.query.featured === 'true';
  }
  if (req.query.industry) {
    filter.industry = req.query.industry;
  }

  const search = buildSearch(req.query.search, ['name', 'industry', 'summary']);
  if (search) {
    Object.assign(filter, search);
  }

  const sort = buildSort(req.query.sort, ['name', 'order', 'since', 'createdAt'], { order: 1, createdAt: -1 });

  const [items, total] = await Promise.all([
    Customer.find(filter).skip(skip).limit(limit).sort(sort),
    Customer.countDocuments(filter)
  ]);

  successResponse(res, { items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return notFound(res);
  successResponse(res, customer);
});

export const createCustomer = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.logo = await persistPublicUpload(req.file);
  }
  const customer = await Customer.create(payload);
  successResponse(res, customer, 'Customer created', 201);
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.logo = await persistPublicUpload(req.file);
  }
  const customer = await Customer.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });
  if (!customer) return notFound(res);
  successResponse(res, customer, 'Customer updated');
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) return notFound(res);
  successResponse(res, null, 'Customer deleted');
});
