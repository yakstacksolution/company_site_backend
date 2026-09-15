import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String },
  company: { type: String },
  quote: { type: String, required: true },
  avatar: { type: String },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  isFeatured: { type: Boolean, default: false }
}, { timestamps: true });

testimonialSchema.index({ isFeatured: 1, createdAt: -1 });

export const Testimonial = mongoose.model('Testimonial', testimonialSchema);
