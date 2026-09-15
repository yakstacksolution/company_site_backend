import jwt from 'jsonwebtoken';

const readToken = (req) => {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7).trim() || null;
};

export const requireAuth = (req, res, next) => {
  const token = readToken(req);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ success: false, message });
  }
};

/**
 * Attaches `req.user` when a valid token is present but never rejects. Used on
 * public list endpoints so an authenticated admin sees unpublished records
 * while anonymous visitors only ever see published content.
 */
export const optionalAuth = (req, res, next) => {
  const token = readToken(req);

  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      req.user = undefined;
    }
  }

  return next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  return next();
};
