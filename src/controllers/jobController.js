import { Job } from '../models/Job.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPagination } from '../utils/pagination.js';
import { buildSearch, buildSort, isAdmin } from '../utils/query.js';
import { successResponse } from '../utils/response.js';
import { uniqueSlug } from '../utils/slug.js';

const notFound = (res) => res.status(404).json({ success: false, message: 'Job not found' });

export const listJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};

  if (req.query.active !== undefined) {
    filter.isActive = req.query.active === 'true';
  } else if (!isAdmin(req)) {
    // Closed roles stay hidden from the public careers page.
    filter.isActive = true;
  }

  if (req.query.department) {
    filter.department = req.query.department;
  }
  if (req.query.type) {
    filter.type = req.query.type;
  }

  const search = buildSearch(req.query.search, ['title', 'department', 'location']);
  if (search) {
    Object.assign(filter, search);
  }

  const sort = buildSort(req.query.sort, ['title', 'createdAt'], { createdAt: -1 });

  const [items, total] = await Promise.all([
    Job.find(filter).skip(skip).limit(limit).sort(sort),
    Job.countDocuments(filter)
  ]);

  successResponse(res, { items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const listJobDepartments = asyncHandler(async (req, res) => {
  const filter = isAdmin(req) ? {} : { isActive: true };
  const departments = await Job.distinct('department', filter);
  successResponse(res, { items: departments.filter(Boolean).sort() });
});

export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, ...(isAdmin(req) ? {} : { isActive: true }) });
  if (!job) return notFound(res);
  successResponse(res, job);
});

export const getJobBySlug = asyncHandler(async (req, res) => {
  const filter = { slug: req.params.slug };
  if (!isAdmin(req)) {
    filter.isActive = true;
  }
  const job = await Job.findOne(filter);
  if (!job) return notFound(res);
  successResponse(res, job);
});

export const createJob = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.slug = payload.slug || (await uniqueSlug(Job, payload.title));
  const job = await Job.create(payload);
  successResponse(res, job, 'Job created', 201);
});

export const updateJob = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.title && !payload.slug) {
    payload.slug = await uniqueSlug(Job, payload.title, req.params.id);
  }
  const job = await Job.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });
  if (!job) return notFound(res);
  successResponse(res, job, 'Job updated');
});

export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndDelete(req.params.id);
  if (!job) return notFound(res);
  successResponse(res, null, 'Job deleted');
});
