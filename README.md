# MiddleMan Platform — Starter

This repository contains a starter scaffold for a production-ready MiddleMan platform.

Tech stack included in scaffold:
- Next.js + TypeScript
- TailwindCSS
- Prisma + PostgreSQL
- Socket.io (stubs)
- JWT auth (stubs)

Quick start

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies:

```bash
npm install
```

3. Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Run the dev server:

```bash
npm run dev
```

Notes
- This scaffold provides pages, components, API route stubs, and a Prisma schema. Implement production details (email provider, file storage, full auth flows, and verification) before deploying.
