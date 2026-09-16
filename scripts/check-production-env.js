import 'dotenv/config';
import { validateEnv } from '../src/config/env.js';

validateEnv();

// eslint-disable-next-line no-console
console.log('Production environment variables look complete.');
