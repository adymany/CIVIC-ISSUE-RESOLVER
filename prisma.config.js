import { loadEnvConfig } from '@next/env';

// Load environment variables
loadEnvConfig(process.cwd(), process.env.NODE_ENV !== 'production');

export default {
  schema: './prisma/schema.prisma',
} 