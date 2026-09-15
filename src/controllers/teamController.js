import { TeamMember } from '../models/TeamMember.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPagination } from '../utils/pagination.js';
import { buildSearch, buildSort } from '../utils/query.js';
import { successResponse } from '../utils/response.js';
import { persistPublicUpload } from './uploadController.js';

const notFound = (res) => res.status(404).json({ success: false, message: 'Team member not found' });

/**
 * Admin forms submit socials as flat fields (multipart can't nest), so fold
 * them into the nested `socials` subdocument the model defines. Only keys the
 * request actually sent are touched, so a partial update can't blank the rest.
 */
const foldSocials = (payload) => {
  const keys = ['linkedin', 'twitter', 'github'];
  const provided = keys.filter((key) => key in payload);
  if (provided.length === 0) {
    return payload;
  }

  const folded = { ...payload };
  provided.forEach((key) => {
    folded[`socials.${key}`] = payload[key] ?? '';
    delete folded[key];
  });
  return folded;
};

export const listTeam = asyncHandler(async (req, res) => {
  const { page, limit, skip } = buildPagination(req.query);
  const filter = {};

  const search = buildSearch(req.query.search, ['name', 'title']);
  if (search) {
    Object.assign(filter, search);
  }

  const sort = buildSort(req.query.sort, ['order', 'name', 'createdAt'], { order: 1, createdAt: 1 });

  const [items, total] = await Promise.all([
    TeamMember.find(filter).skip(skip).limit(limit).sort(sort),
    TeamMember.countDocuments(filter)
  ]);

  successResponse(res, { items, total, page, limit, pages: Math.ceil(total / limit) });
});

export const getTeamMember = asyncHandler(async (req, res) => {
  const member = await TeamMember.findById(req.params.id);
  if (!member) return notFound(res);
  successResponse(res, member);
});

export const createTeamMember = asyncHandler(async (req, res) => {
  const payload = foldSocials({ ...req.body });
  if (req.file) {
    payload.photo = await persistPublicUpload(req.file);
  }
  const member = await TeamMember.create(payload);
  successResponse(res, member, 'Team member created', 201);
});

export const updateTeamMember = asyncHandler(async (req, res) => {
  const payload = foldSocials({ ...req.body });
  if (req.file) {
    payload.photo = await persistPublicUpload(req.file);
  }
  const member = await TeamMember.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });
  if (!member) return notFound(res);
  successResponse(res, member, 'Team member updated');
});

export const deleteTeamMember = asyncHandler(async (req, res) => {
  const member = await TeamMember.findByIdAndDelete(req.params.id);
  if (!member) return notFound(res);
  successResponse(res, null, 'Team member deleted');
});
