import mongoose from 'mongoose';

/**
 * A customer/client of the company. Kept separate from Testimonial: a logo may
 * be shown on the clients wall without anyone having given a quote, and a quote
 * may exist for a person whose employer we cannot name.
 */
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String },
  logoAlt: { type: String },
  website: { type: String },
  industry: { type: String },
  country: { type: String },
  // Short line used on the featured cards, e.g. "Payments platform, 4 years".
  summary: { type: String },
  // Optional link to a published case study (Project slug).
  projectSlug: { type: String },
  since: { type: Number },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

customerSchema.index({ isActive: 1, order: 1 });
customerSchema.index({ isFeatured: 1, order: 1 });

export const Customer = mongoose.model('Customer', customerSchema);
