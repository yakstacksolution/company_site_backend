import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import { Admin } from './models/Admin.js';

dotenv.config();
const [name, email, password] = process.argv.slice(2);
if (!name || !email || !password || password.length < 12) {
  console.error('Usage: npm run create-admin -- "Full Name" email@example.com "StrongPassword123" (minimum 12 characters)');
  process.exit(1);
}
await connectDb();
if (await Admin.exists({ email: email.toLowerCase() })) throw new Error('An account with that email already exists');
await Admin.create({ name, email, password, role: 'admin' });
console.log(`Administrator created: ${email}`);
await mongoose.disconnect();
