import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: { type: String, required: true },
  description: { type: String },
  client: { type: String },
  industry: { type: String },
  techStack: [{ type: String }],
  coverImage: { type: String },
  coverImageAlt: { type: String },
  gallery: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  order: { type: Number, default: 0 },
  seo: { title: String, description: String, image: String }
}, { timestamps: true });

projectSchema.index({ isFeatured: 1, createdAt: -1 });
projectSchema.index({ industry: 1 });
projectSchema.index({ status: 1, order: 1 });

export const Project = mongoose.model('Project', projectSchema);
