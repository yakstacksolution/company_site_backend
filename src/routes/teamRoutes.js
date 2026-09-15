import express from 'express';
import {
  createTeamMember,
  deleteTeamMember,
  getTeamMember,
  listTeam,
  updateTeamMember
} from '../controllers/teamController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import { validate } from '../middlewares/validate.js';
import { teamSchema, teamUpdateSchema } from '../validators/index.js';

export const teamRoutes = express.Router();

const adminOnly = [requireAuth, requireRole('admin', 'editor')];

teamRoutes.get('/', listTeam);
teamRoutes.get('/:id', getTeamMember);
teamRoutes.post('/', ...adminOnly, upload.single('photo'), validate(teamSchema), createTeamMember);
teamRoutes.put('/:id', ...adminOnly, upload.single('photo'), validate(teamUpdateSchema), updateTeamMember);
teamRoutes.delete('/:id', ...adminOnly, deleteTeamMember);
