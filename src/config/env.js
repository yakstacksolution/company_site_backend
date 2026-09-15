const requiredProduction = [
  'MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'CORS_ORIGIN', 'SITE_URL',
  'S3_ENDPOINT', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY', 'S3_PUBLIC_BUCKET', 'S3_PRIVATE_BUCKET', 'ANALYTICS_SALT'
];

export const validateEnv = () => {
  if (process.env.NODE_ENV !== 'production') return;
  const missing = requiredProduction.filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
  if ((process.env.JWT_SECRET || '').length < 32 || (process.env.JWT_REFRESH_SECRET || '').length < 32) {
    throw new Error('JWT secrets must each contain at least 32 characters');
  }
};
