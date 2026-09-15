import mongoose from 'mongoose';

const seoSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  imageAlt: String
}, { _id: false });

// Shared shape for a section or page heading: not every surface uses all four,
// which is why they are all optional rather than split into separate schemas.
const headerSchema = new mongoose.Schema({
  eyebrow: String,
  title: String,
  subtitle: String,
  lead: String,
  // Page-level extras: the meta description, and an override for the closing
  // call-to-action band where a page needs its own.
  seoDescription: String,
  ctaTitle: String,
  ctaBody: String
}, { _id: false });

const linkSchema = new mongoose.Schema({ label: { type: String, required: true }, href: { type: String, required: true } }, { _id: false });
const itemSchema = new mongoose.Schema({ title: String, body: String, value: String, label: String, icon: String }, { _id: false });

const siteContentSchema = new mongoose.Schema({
  locale: { type: String, default: 'en', unique: true },
  isPublished: { type: Boolean, default: true },
  navigation: { links: [linkSchema], cta: linkSchema },
  hero: {
    eyebrow: String,
    headline: String,
    highlightedText: String,
    lead: String,
    primaryCta: linkSchema,
    secondaryCta: linkSchema
  },
  stats: [itemSchema],
  sectors: [String],
  // `story` is the longer narrative shown on the about page under `body`.
  about: { eyebrow: String, title: String, body: String, story: String, features: [String] },
  differentiators: [itemSchema],
  process: [itemSchema],
  // Hero capability panel.
  delivery: { eyebrow: String, title: String, items: [itemSchema] },
  // Working principles, shared by the homepage and the about page.
  principles: { heading: String, items: [itemSchema], assurances: [String] },
  // Section headings on the homepage.
  sections: {
    services: headerSchema,
    work: headerSchema,
    process: headerSchema,
    team: headerSchema,
    testimonials: headerSchema,
    insights: headerSchema,
    customers: headerSchema,
    benefits: headerSchema,
    roles: headerSchema,
    differentiators: headerSchema,
    aboutTeam: headerSchema
  },
  // Page headers and closing copy for the standalone pages.
  pages: {
    services: headerSchema,
    projects: headerSchema,
    blog: headerSchema,
    careers: headerSchema,
    contact: headerSchema,
    about: headerSchema
  },
  benefits: [itemSchema],
  contactSteps: [String],
  // Options in the contact form's subject dropdown.
  contactSubjects: [String],
  ctaAssurances: [String],
  cta: { eyebrow: String, title: String, body: String, action: linkSchema },
  careers: { eyebrow: String, title: String, body: String },
  footer: { summary: String, columns: [{ heading: String, links: [linkSchema] }] },
  legal: { privacy: String, terms: String, updatedAt: Date },
  seo: { home: seoSchema, about: seoSchema, services: seoSchema, projects: seoSchema, blog: seoSchema, careers: seoSchema, contact: seoSchema }
}, { timestamps: true });

export const SiteContent = mongoose.model('SiteContent', siteContentSchema);
