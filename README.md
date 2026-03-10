# 🧪 Enterprise Testing Sandbox

A full-stack testing playground with Auth, Dashboard, CRUD operations, and multi-step checkout.

## Tech Stack
- **Frontend**: Next.js 14, React 18, TailwindCSS 3
- **Backend**: Next.js API Routes
- **Database**: SQLite (local) / PostgreSQL (production via Neon)
- **Auth**: JWT (mock auth - any password works)
- **ORM**: Prisma 5.14

## Local Development

### Quick Start
```bash
cd apps/web
npm install
npx prisma generate
npx next dev -p 3000
```

Open http://localhost:3000 and login with:
- Email: user1@example.com (admin) or user2-user10@example.com
- Password: anything (mock auth)

## Free Production Deployment (Vercel + Neon)

1. Create free Neon PostgreSQL at https://neon.tech
2. Push to GitHub
3. Import to Vercel at https://vercel.com, set Root Directory to apps/web
4. Add env vars: DATABASE_URL, DIRECT_URL, JWT_SECRET
5. Deploy!
