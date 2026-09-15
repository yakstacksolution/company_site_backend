import { Service } from '../models/Service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPagination } from '../utils/pagination.js';
import { buildSearch, buildSort, isAdmin } from '../utils/query.js';
import { successResponse } from '../utils/response.js';
import { uniqueSlug } from '../utils/slug.js';

const notFound = (res) => res.status(404).json({ success: false, message: 'Service not found' });

export const listServices = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};

  if (req.query.active !== undefined) {
    filter.isActive = req.query.active === 'true';
  } else if (!isAdmin(req)) {
    // Anonymous visitors only ever see live services.
    filter.isActive = true;
  }

  const search = buildSearch(req.query.search, ['title', 'description']);
  if (search) {
    Object.assign(filter, search);
  }

  const sort = buildSort(req.query.sort, ['order', 'title', 'createdAt'], { order: 1, createdAt: -1 });

  const [items, total] = await Promise.all([
    Service.find(filter).skip(skip).limit(limit).sort(sort),
    Service.countDocuments(filter)
  ]);

  successResponse(res, { items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const getService = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ _id: req.params.id, ...(isAdmin(req) ? {} : { isActive: true }) });
  if (!service) return notFound(res);
  successResponse(res, service);
});

export const getServiceBySlug = asyncHandler(async (req, res) => {
  const filter = { slug: req.params.slug };
  if (!isAdmin(req)) {
    filter.isActive = true;
  }
  const service = await Service.findOne(filter);
  if (!service) return notFound(res);
  successResponse(res, service);
});

export const createService = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.slug = payload.slug || (await uniqueSlug(Service, payload.title));
  const service = await Service.create(payload);
  successResponse(res, service, 'Service created', 201);
});

export const updateService = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.title && !payload.slug) {
    payload.slug = await uniqueSlug(Service, payload.title, req.params.id);
  }
  const service = await Service.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });
  if (!service) return notFound(res);
  successResponse(res, service, 'Service updated');
});

export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) return notFound(res);
  successResponse(res, null, 'Service deleted');
});
