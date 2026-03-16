import { defineConfig } from 'prisma';

export default defineConfig({
  migrations: {
    seed: 'ts-node ./prisma/seed-neon.js',
  },
  datasource: {
    url: process.env.DATABASE_URL || '',
  },
});
