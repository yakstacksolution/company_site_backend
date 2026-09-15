import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String },
  coverImageAlt: { type: String },
  tags: [{ type: String }],
  author: { type: String, required: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  publishedAt: { type: Date },
  readingMinutes: { type: Number, default: 1 },
  order: { type: Number, default: 0 },
  seo: { title: String, description: String, image: String }
}, { timestamps: true });

// Derived from the body so the website can show "5 min read" without
// shipping the whole article to list views.
blogSchema.pre('save', function setReadingTime(next) {
  if (this.isModified('content')) {
    const words = this.content.trim().split(/\s+/).filter(Boolean).length;
    this.readingMinutes = Math.max(1, Math.round(words / 200));
  }
  next();
});

blogSchema.pre('findOneAndUpdate', function setReadingTimeOnUpdate(next) {
  const update = this.getUpdate() || {};
  const content = update.content ?? update.$set?.content;
  if (typeof content === 'string') {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    this.set('readingMinutes', Math.max(1, Math.round(words / 200)));
  }
  next();
});

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });

export const Blog = mongoose.model('Blog', blogSchema);
