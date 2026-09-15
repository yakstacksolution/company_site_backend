import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  jobTitle: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true },
  phone: String,
  portfolioUrl: String,
  coverMessage: { type: String, required: true },
  cvKey: { type: String, required: true, select: false },
  cvFilename: { type: String, required: true },
  cvMimeType: { type: String, required: true },
  consentAt: { type: Date, required: true },
  status: { type: String, enum: ['new', 'reviewing', 'shortlisted', 'rejected', 'hired'], default: 'new', index: true },
  internalNotes: { type: String, default: '' }
}, { timestamps: true });

jobApplicationSchema.index({ createdAt: -1 });
jobApplicationSchema.index({ email: 1, job: 1 });

export const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);
