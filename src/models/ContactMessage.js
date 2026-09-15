import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String },
  message: { type: String, required: true },
  status: { type: String, enum: ['new', 'in_progress', 'resolved'], default: 'new' }
}, { timestamps: true });

contactMessageSchema.index({ status: 1, createdAt: -1 });

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
