import mongoose from 'mongoose';
import app from './app.js';
import { connectDb } from './config/db.js';
import { validateEnv } from './config/env.js';

const PORT = process.env.PORT || 5001;

const start = async () => {
  validateEnv();
  await connectDb();

  const server = app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Yak Stack Solution API running on port ${PORT}`);
  });

  // Close the HTTP listener before the database so in-flight requests can
  // finish, rather than failing mid-query on shutdown.
  const shutdown = async (signal) => {
    // eslint-disable-next-line no-console
    console.log(`\n${signal} received, shutting down.`);
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));
};

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
});
