import mongoose from 'mongoose';

const websiteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Yak Stack Solution' },
  logo: { type: String },
  favicon: { type: String },
  primaryColor: { type: String, default: '#0F2B46' },
  secondaryColor: { type: String, default: '#F59E0B' },
  address: { type: String, default: 'Madhyapur Thimi-03, Bhimsen Marg, Bhaktapur, Nepal' },
  phone: { type: String, default: '+977 986-8187579' },
  email: { type: String, default: 'yakstacksolution@gmail.com' },
  foundedYear: { type: Number, default: 2025 },
  companyDescription: { type: String, default: 'Yak Stack Solution is a software engineering company designing and building websites, mobile and desktop apps, cloud platforms and digital products for organisations worldwide.' },
  socials: {
    linkedin: { type: String },
    twitter: { type: String },
    github: { type: String },
    dribbble: { type: String }
  },
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }],
    defaultImage: { type: String },
    defaultImageAlt: { type: String }
  }
}, { timestamps: true });

export const WebsiteSettings = mongoose.model('WebsiteSettings', websiteSettingsSchema);
