import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  icon: { type: String },
  image: { type: String },
  imageAlt: { type: String },
  features: [{ type: String }],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  seo: { title: String, description: String, image: String }
}, { timestamps: true });

serviceSchema.index({ isActive: 1, order: 1 });

export const Service = mongoose.model('Service', serviceSchema);
