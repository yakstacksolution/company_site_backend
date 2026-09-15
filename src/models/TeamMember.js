import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  bio: { type: String },
  photo: { type: String },
  order: { type: Number, default: 0 },
  socials: {
    linkedin: { type: String },
    twitter: { type: String },
    github: { type: String }
  }
}, { timestamps: true });

teamMemberSchema.index({ order: 1, createdAt: 1 });

export const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
