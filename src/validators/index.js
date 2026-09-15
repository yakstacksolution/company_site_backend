import { z } from 'zod';

/**
 * Admin forms post as multipart/form-data whenever an image is attached, so
 * every field arrives as a string. These helpers coerce the primitives and
 * accept either a real array or a comma-separated string for list fields.
 */
const trimmed = z.string().trim();

const list = z
  .union([z.array(trimmed), trimmed])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    const parts = Array.isArray(value) ? value : value.split(',');
    return parts.map((item) => item.trim()).filter(Boolean);
  });

const boolish = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .optional()
  .transform((value) => (typeof value === 'string' ? value === 'true' : value));

const optionalText = trimmed.optional().or(z.literal('').transform(() => undefined));

const slug = trimmed
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers and hyphens')
  .optional()
  .or(z.literal('').transform(() => undefined));

const email = trimmed.email('Enter a valid email address');
const url = optionalText;
const link = z.object({ label: trimmed.min(1), href: trimmed.min(1) });
const contentItem = z.object({ title: optionalText, body: optionalText, value: optionalText, label: optionalText, icon: optionalText });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required')
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10, 'Refresh token is required').optional()
});

export const logoutSchema = z.object({
  refreshToken: z.string().optional()
});

export const adminCreateSchema = z.object({
  name: trimmed.min(2, 'Name must be at least 2 characters'),
  email,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password needs a lowercase letter')
    .regex(/[A-Z]/, 'Password needs an uppercase letter')
    .regex(/[0-9]/, 'Password needs a number'),
  role: z.enum(['admin', 'editor']).optional()
});

export const adminUpdateSchema = adminCreateSchema.partial();

export const serviceSchema = z.object({
  title: trimmed.min(2, 'Title must be at least 2 characters'),
  slug,
  description: trimmed.min(10, 'Description must be at least 10 characters'),
  icon: optionalText,
  image: optionalText,
  imageAlt: optionalText,
  features: list,
  isActive: boolish,
  order: z.coerce.number().int().optional()
});

export const projectSchema = z.object({
  title: trimmed.min(2, 'Title must be at least 2 characters'),
  slug,
  summary: trimmed.min(10, 'Summary must be at least 10 characters'),
  description: optionalText,
  client: optionalText,
  industry: optionalText,
  techStack: list,
  coverImage: optionalText,
  coverImageAlt: optionalText,
  gallery: list,
  isFeatured: boolish,
  status: z.enum(['draft', 'published']).optional(),
  order: z.coerce.number().int().optional()
});

export const blogSchema = z.object({
  title: trimmed.min(2, 'Title must be at least 2 characters'),
  slug,
  excerpt: trimmed.min(10, 'Excerpt must be at least 10 characters'),
  content: trimmed.min(20, 'Content must be at least 20 characters'),
  coverImage: optionalText,
  coverImageAlt: optionalText,
  tags: list,
  author: trimmed.min(2, 'Author is required'),
  status: z.enum(['draft', 'published']).optional(),
  order: z.coerce.number().int().optional()
});

export const teamSchema = z.object({
  name: trimmed.min(2, 'Name must be at least 2 characters'),
  title: trimmed.min(2, 'Role is required'),
  bio: optionalText,
  photo: optionalText,
  order: z.coerce.number().int().optional(),
  linkedin: url,
  twitter: url,
  github: url
});

export const testimonialSchema = z.object({
  name: trimmed.min(2, 'Name must be at least 2 characters'),
  role: optionalText,
  company: optionalText,
  quote: trimmed.min(10, 'Quote must be at least 10 characters'),
  avatar: optionalText,
  rating: z.coerce.number().int().min(1).max(5).optional(),
  isFeatured: boolish
});

export const customerSchema = z.object({
  name: trimmed.min(2, 'Name must be at least 2 characters'),
  logo: optionalText,
  logoAlt: optionalText,
  website: url,
  industry: optionalText,
  country: optionalText,
  summary: optionalText,
  projectSlug: slug,
  since: z.coerce.number().int().min(1900).max(2200).optional(),
  isFeatured: boolish,
  isActive: boolish,
  order: z.coerce.number().int().optional()
});

export const jobSchema = z.object({
  title: trimmed.min(2, 'Title must be at least 2 characters'),
  slug,
  department: optionalText,
  location: optionalText,
  type: z.enum(['Full-time', 'Part-time', 'Contract', 'Internship']).optional(),
  description: trimmed.min(10, 'Description must be at least 10 characters'),
  requirements: list,
  applyEmail: email,
  isActive: boolish,
  order: z.coerce.number().int().optional()
});

export const contactSchema = z.object({
  name: trimmed.min(2, 'Please tell us your name'),
  email,
  phone: optionalText,
  subject: optionalText,
  message: trimmed.min(10, 'Please give us a little more detail').max(5000),
  // Hidden field that real users never fill in; bots usually do.
  honeypot: z.string().max(0, 'Rejected').optional()
});

export const contactUpdateSchema = z.object({
  status: z.enum(['new', 'in_progress', 'resolved'])
});

export const settingsSchema = z.object({
  siteName: optionalText,
  logo: optionalText,
  favicon: optionalText,
  primaryColor: optionalText,
  secondaryColor: optionalText,
  address: optionalText,
  phone: optionalText,
  email: email.optional().or(z.literal('').transform(() => undefined)),
  foundedYear: z.coerce.number().int().min(1900).max(2200).optional(),
  companyDescription: optionalText,
  socials: z
    .object({
      linkedin: url,
      twitter: url,
      github: url,
      dribbble: url
    })
    .partial()
    .optional(),
  seo: z
    .object({
      metaTitle: optionalText,
      metaDescription: optionalText,
      keywords: list,
      defaultImage: optionalText,
      defaultImageAlt: optionalText
    })
    .partial()
    .optional()
});

export const siteContentSchema = z.object({
  isPublished: boolish,
  navigation: z.object({ links: z.array(link), cta: link.optional() }).partial().optional(),
  hero: z.object({ eyebrow: optionalText, headline: optionalText, highlightedText: optionalText, lead: optionalText, primaryCta: link.optional(), secondaryCta: link.optional() }).partial().optional(),
  stats: z.array(contentItem).optional(),
  sectors: z.array(trimmed).optional(),
  about: z.object({ eyebrow: optionalText, title: optionalText, body: optionalText, features: z.array(trimmed).optional() }).partial().optional(),
  differentiators: z.array(contentItem).optional(),
  process: z.array(contentItem).optional(),
  cta: z.object({ eyebrow: optionalText, title: optionalText, body: optionalText, action: link.optional() }).partial().optional(),
  careers: z.object({ eyebrow: optionalText, title: optionalText, body: optionalText }).partial().optional(),
  footer: z.object({ summary: optionalText, columns: z.array(z.object({ heading: optionalText, links: z.array(link) })).optional() }).partial().optional(),
  legal: z.object({ privacy: optionalText, terms: optionalText }).partial().optional(),
  seo: z.record(z.string(), z.object({ title: optionalText, description: optionalText, image: optionalText, imageAlt: optionalText }).partial()).optional()
}).partial();

export const jobApplicationSchema = z.object({
  jobId: trimmed.regex(/^[a-f\d]{24}$/i, 'Invalid role'),
  name: trimmed.min(2).max(120), email, phone: optionalText,
  portfolioUrl: optionalText, coverMessage: trimmed.min(20).max(5000),
  consent: z.union([z.literal('true'), z.literal(true)]), honeypot: z.string().max(0).optional()
});

export const jobApplicationUpdateSchema = z.object({
  status: z.enum(['new', 'reviewing', 'shortlisted', 'rejected', 'hired']).optional(),
  internalNotes: trimmed.max(10000).optional()
});

export const analyticsEventSchema = z.object({
  path: trimmed.startsWith('/').max(500), referrer: optionalText
});

// Partial variants for PUT, so updating one field doesn't require resending all.
export const serviceUpdateSchema = serviceSchema.partial();
export const projectUpdateSchema = projectSchema.partial();
export const blogUpdateSchema = blogSchema.partial();
export const teamUpdateSchema = teamSchema.partial();
export const testimonialUpdateSchema = testimonialSchema.partial();
export const customerUpdateSchema = customerSchema.partial();
export const jobUpdateSchema = jobSchema.partial();
