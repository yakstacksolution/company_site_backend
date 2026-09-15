import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  path: { type: String, required: true, index: true },
  referrerHost: String,
  device: { type: String, enum: ['mobile', 'tablet', 'desktop', 'unknown'], default: 'unknown' },
  visitorHash: { type: String, required: true },
  occurredAt: { type: Date, default: Date.now },
  day: { type: String, required: true, index: true }
}, { timestamps: false });

analyticsEventSchema.index({ day: 1, path: 1 });
analyticsEventSchema.index({ occurredAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 400 });

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
