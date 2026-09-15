import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import { signAccessToken, signRefreshToken } from '../utils/token.js';

const publicAdmin = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  lastLoginAt: admin.lastLoginAt
});

const issueTokens = (admin) => {
  const payload = { id: admin._id, role: admin.role, email: admin.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
};

const tokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex');
const readCookies = (req) => Object.fromEntries((req.headers.cookie || '').split(';').map((part) => part.trim().split('=').map(decodeURIComponent)).filter((pair) => pair.length === 2));
const cookieOptions = () => `HttpOnly; Path=/api/auth; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
const setRefreshCookie = (res, token) => res.setHeader('Set-Cookie', `refreshToken=${encodeURIComponent(token)}; ${cookieOptions()}`);
const clearRefreshCookie = (res) => res.setHeader('Set-Cookie', `refreshToken=; HttpOnly; Path=/api/auth; SameSite=Strict; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select('+password');

  // Same response for unknown email and wrong password, so the endpoint can't
  // be used to enumerate valid accounts.
  const invalid = () => res.status(401).json({ success: false, message: 'Invalid credentials' });

  if (!admin) return invalid();
  if (!(await admin.comparePassword(password))) return invalid();

  const { accessToken, refreshToken } = issueTokens(admin);
  admin.refreshTokenHash = tokenHash(refreshToken);
  admin.lastLoginAt = new Date();
  await admin.save();

  setRefreshCookie(res, refreshToken);
  successResponse(res, { accessToken, admin: publicAdmin(admin) }, 'Login successful');
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = readCookies(req).refreshToken || req.body.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: 'Refresh token is required' });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }

  // `refreshToken` is `select: false` on the model, so ask for it explicitly.
  const admin = await Admin.findById(payload.id).select('+refreshTokenHash');
  // The stored-token check makes logout actually revoke access and stops a
  // stolen refresh token from being replayed after rotation.
  if (!admin || admin.refreshTokenHash !== tokenHash(token)) {
    return res.status(401).json({ success: false, message: 'Refresh token mismatch' });
  }

  const tokens = issueTokens(admin);
  admin.refreshTokenHash = tokenHash(tokens.refreshToken);
  await admin.save();
  setRefreshCookie(res, tokens.refreshToken);
  successResponse(res, { accessToken: tokens.accessToken, admin: publicAdmin(admin) }, 'Token refreshed');
});

export const me = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id);
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }
  successResponse(res, publicAdmin(admin));
});

export const logout = asyncHandler(async (req, res) => {
  const token = readCookies(req).refreshToken || req.body.refreshToken;
  if (token) {
    await Admin.updateOne({ refreshTokenHash: tokenHash(token) }, { $set: { refreshTokenHash: null } });
  }
  clearRefreshCookie(res);
  successResponse(res, null, 'Logged out');
});
