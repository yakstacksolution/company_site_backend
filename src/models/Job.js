import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  department: { type: String },
  location: { type: String },
  type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  applyEmail: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  seo: { title: String, description: String, image: String }
}, { timestamps: true });

jobSchema.index({ isActive: 1, createdAt: -1 });

export const Job = mongoose.model('Job', jobSchema);
