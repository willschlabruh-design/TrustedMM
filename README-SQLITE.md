Local SQLite setup

This project can run with a local SQLite database for development. Steps:

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client and create the SQLite database/migration:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

3. Start the dev server:

```bash
npm run dev
```

Notes:
- `.env` already points `DATABASE_URL` to `prisma/dev.db`. If you change it, update `prisma/schema.prisma` accordingly.
- If you have an existing Postgres schema and want to keep it, revert the datasource change and use your Postgres `DATABASE_URL`.
