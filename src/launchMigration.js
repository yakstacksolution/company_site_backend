import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import { Admin } from './models/Admin.js';
import { Blog } from './models/Blog.js';
import { ContactMessage } from './models/ContactMessage.js';
import { Job } from './models/Job.js';
import { Project } from './models/Project.js';
import { Service } from './models/Service.js';
import { TeamMember } from './models/TeamMember.js';
import { Testimonial } from './models/Testimonial.js';
import { WebsiteSettings } from './models/WebsiteSettings.js';
import { SiteContent } from './models/SiteContent.js';
import { defaultSiteContent } from './controllers/siteContentController.js';

dotenv.config();
await connectDb();

// Idempotent: every operation converges on the same clean launch state.
await Promise.all([Service.deleteMany({}), Project.deleteMany({}), Blog.deleteMany({}), TeamMember.deleteMany({}), Testimonial.deleteMany({}), Job.deleteMany({}), ContactMessage.deleteMany({})]);
await Admin.deleteMany({ email: { $in: ['admin@yakstack.com', 'editor@yakstack.com'] } });
await WebsiteSettings.findOneAndUpdate({}, {
  siteName: 'Yak Stack Solution', foundedYear: 2025,
  email: 'yakstacksolution@gmail.com', phone: '+977 986-8187579',
  address: 'Madhyapur Thimi-03, Bhimsen Marg, Bhaktapur, Nepal',
  companyDescription: defaultSiteContent.hero.lead,
  seo: { metaTitle: 'Yak Stack Solution | Software, cloud and product engineering', metaDescription: defaultSiteContent.hero.lead, keywords: ['software company Nepal', 'web development Nepal', 'mobile app development'] }
}, { upsert: true, new: true });
await SiteContent.findOneAndUpdate({ locale: 'en' }, defaultSiteContent, { upsert: true, new: true });

console.log('Launch content migration complete. Demo records and demo accounts removed.');
await mongoose.disconnect();
