import { Project } from '../models/Project.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPagination } from '../utils/pagination.js';
import { buildSearch, buildSort, isAdmin } from '../utils/query.js';
import { successResponse } from '../utils/response.js';
import { uniqueSlug } from '../utils/slug.js';
import { persistPublicUpload } from './uploadController.js';

const notFound = (res) => res.status(404).json({ success: false, message: 'Project not found' });

export const listProjects = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};
  if (isAdmin(req)) {
    if (req.query.status) filter.status = req.query.status;
  } else {
    filter.status = 'published';
  }

  if (req.query.featured !== undefined) {
    filter.isFeatured = req.query.featured === 'true';
  }
  if (req.query.industry) {
    filter.industry = req.query.industry;
  }
  if (req.query.tech) {
    filter.techStack = req.query.tech;
  }

  const search = buildSearch(req.query.search, ['title', 'summary', 'client', 'industry']);
  if (search) {
    Object.assign(filter, search);
  }

  const sort = buildSort(req.query.sort, ['title', 'createdAt'], { createdAt: -1 });

  const [items, total] = await Promise.all([
    Project.find(filter).skip(skip).limit(limit).sort(sort),
    Project.countDocuments(filter)
  ]);

  successResponse(res, { items, total, page, limit, pages: Math.ceil(total / limit) });
});

/** Distinct industry values, so the website can build its filter bar. */
export const listProjectIndustries = asyncHandler(async (req, res) => {
  const industries = await Project.distinct('industry', isAdmin(req) ? {} : { status: 'published' });
  successResponse(res, { items: industries.filter(Boolean).sort() });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id, ...(isAdmin(req) ? {} : { status: 'published' }) });
  if (!project) return notFound(res);
  successResponse(res, project);
});

export const getProjectBySlug = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug, ...(isAdmin(req) ? {} : { status: 'published' }) });
  if (!project) return notFound(res);

  const related = await Project.find({
    _id: { $ne: project._id },
    ...(project.industry ? { industry: project.industry } : {}), status: 'published'
  })
    .select('title slug summary coverImage industry')
    .limit(3);

  successResponse(res, { project, related });
});

export const createProject = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  payload.slug = payload.slug || (await uniqueSlug(Project, payload.title));
  if (req.file) {
    payload.coverImage = await persistPublicUpload(req.file);
  }
  const project = await Project.create(payload);
  successResponse(res, project, 'Project created', 201);
});

export const updateProject = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.title && !payload.slug) {
    payload.slug = await uniqueSlug(Project, payload.title, req.params.id);
  }
  if (req.file) {
    payload.coverImage = await persistPublicUpload(req.file);
  }
  const project = await Project.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });
  if (!project) return notFound(res);
  successResponse(res, project, 'Project updated');
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return notFound(res);
  successResponse(res, null, 'Project deleted');
});
