import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import { seedDatabase } from './seedData.js';

dotenv.config();

const run = async () => {
  await connectDb();
  const { admin, counts } = await seedDatabase();
  await mongoose.connection.close();

  /* eslint-disable no-console */
  console.log('Seeded database.');
  console.log(`  Admin:  ${admin.email} / Admin@123456`);
  console.log('  Editor: editor@yakstack.com / Editor@123456');
  console.log(
    `  Content: ${counts.services} services, ${counts.projects} projects, ${counts.blogs} posts, ` +
      `${counts.team} team, ${counts.testimonials} testimonials, ${counts.jobs} jobs, ${counts.contacts} leads`
  );
  /* eslint-enable no-console */
  process.exit(0);
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error);
  process.exit(1);
});
