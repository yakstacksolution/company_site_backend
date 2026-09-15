import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
};

export const signRefreshToken = (payload) => {
  // `iat` only has second granularity, so re-signing the same payload within
  // the same second produced a byte-identical token — rotation then left the
  // old token still valid. A random jti guarantees every issue is distinct.
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};
