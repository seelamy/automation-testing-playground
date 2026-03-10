// swap-schema.js — Swaps to PostgreSQL schema for production builds on Vercel
const fs = require('fs');
const path = require('path');

const prodSchema = path.join(__dirname, 'prisma', 'schema.prod.prisma');
const activeSchema = path.join(__dirname, 'prisma', 'schema.prisma');

// Only swap if VERCEL env is set (i.e., running on Vercel) or DATABASE_URL contains 'postgresql'
const dbUrl = process.env.DATABASE_URL || '';
if (process.env.VERCEL || dbUrl.includes('postgresql') || dbUrl.includes('neon.tech')) {
  console.log('Production build detected — swapping to PostgreSQL schema');
  fs.copyFileSync(prodSchema, activeSchema);
  console.log('Schema swapped to PostgreSQL');
} else {
  console.log('Local build — keeping SQLite schema');
}
