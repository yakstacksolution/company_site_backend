/**
 * Runs the API against a throwaway in-memory MongoDB and seeds it, so the full
 * stack works without installing MongoDB locally:
 *
 *   npm run dev:memory
 *
 * Data is discarded when the process exits. Use `npm run dev` against a real
 * MONGO_URI for anything you want to keep.
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

const PORT = process.env.PORT || 5001;

const start = async () => {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri('yakstack');

  await mongoose.connect(process.env.MONGO_URI);

  // Imported after MONGO_URI is set so the models bind to this connection.
  const { seedDatabase } = await import('./seedData.js');
  await seedDatabase();

  const { default: app } = await import('./app.js');
  const server = app.listen(PORT, () => {
    /* eslint-disable no-console */
    console.log(`\nYak Stack Solution API (in-memory) on http://localhost:${PORT}`);
    console.log('  Admin:  admin@yakstack.com / Admin@123456');
    console.log('  Editor: editor@yakstack.com / Editor@123456');
    console.log('\nData is in-memory and resets when you stop this process.\n');
    /* eslint-enable no-console */
  });

  const shutdown = async () => {
    server.close(async () => {
      await mongoose.disconnect();
      await mongo.stop();
      process.exit(0);
    });
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, shutdown));
};

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start in-memory server:', error);
  process.exit(1);
});
