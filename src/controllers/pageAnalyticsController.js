import crypto from 'crypto';
import { AnalyticsEvent } from '../models/AnalyticsEvent.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';

const deviceFromAgent = (agent = '') => {
  if (/tablet|ipad/i.test(agent)) return 'tablet';
  if (/mobile|android|iphone/i.test(agent)) return 'mobile';
  return agent ? 'desktop' : 'unknown';
};

export const recordPageView = asyncHandler(async (req, res) => {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const forwarded = req.ip || req.socket.remoteAddress || '';
  const visitorHash = crypto
    .createHmac('sha256', process.env.ANALYTICS_SALT || process.env.JWT_SECRET)
    .update(`${day}:${forwarded}:${req.headers['user-agent'] || ''}`)
    .digest('hex').slice(0, 24);

  let referrerHost;
  try { referrerHost = req.body.referrer ? new URL(req.body.referrer).hostname : undefined; } catch { referrerHost = undefined; }

  await AnalyticsEvent.create({ path: req.body.path, referrerHost, device: deviceFromAgent(req.headers['user-agent']), visitorHash, occurredAt: now, day });
  res.status(204).end();
});

export const getPageAnalytics = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [views, visitors, popularPages] = await Promise.all([
    AnalyticsEvent.countDocuments({ occurredAt: { $gte: since } }),
    AnalyticsEvent.distinct('visitorHash', { occurredAt: { $gte: since } }),
    AnalyticsEvent.aggregate([
      { $match: { occurredAt: { $gte: since } } },
      { $group: { _id: '$path', views: { $sum: 1 }, visitors: { $addToSet: '$visitorHash' } } },
      { $project: { path: '$_id', _id: 0, views: 1, visitors: { $size: '$visitors' } } },
      { $sort: { views: -1 } }, { $limit: 10 }
    ])
  ]);
  successResponse(res, { periodDays: 30, views, visitors: visitors.length, popularPages });
});
