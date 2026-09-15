import { Testimonial } from '../models/Testimonial.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPagination } from '../utils/pagination.js';
import { buildSearch, buildSort } from '../utils/query.js';
import { successResponse } from '../utils/response.js';
import { persistPublicUpload } from './uploadController.js';

const notFound = (res) => res.status(404).json({ success: false, message: 'Testimonial not found' });

export const listTestimonials = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};

  if (req.query.featured !== undefined) {
    filter.isFeatured = req.query.featured === 'true';
  }

  const search = buildSearch(req.query.search, ['name', 'company', 'quote']);
  if (search) {
    Object.assign(filter, search);
  }

  const sort = buildSort(req.query.sort, ['name', 'rating', 'createdAt'], { createdAt: -1 });

  const [items, total] = await Promise.all([
    Testimonial.find(filter).skip(skip).limit(limit).sort(sort),
    Testimonial.countDocuments(filter)
  ]);

  successResponse(res, { items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const getTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) return notFound(res);
  successResponse(res, testimonial);
});

export const createTestimonial = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.avatar = await persistPublicUpload(req.file);
  }
  const testimonial = await Testimonial.create(payload);
  successResponse(res, testimonial, 'Testimonial created', 201);
});

export const updateTestimonial = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (req.file) {
    payload.avatar = await persistPublicUpload(req.file);
  }
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });
  if (!testimonial) return notFound(res);
  successResponse(res, testimonial, 'Testimonial updated');
});

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) return notFound(res);
  successResponse(res, null, 'Testimonial deleted');
});
