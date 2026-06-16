import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const schema = fs.readFileSync(
    path.join(process.cwd(), "prisma", "schema.prisma"),
    "utf8"
  );

  res.status(200).json({
    databaseUrl: process.env.DATABASE_URL?.replace(/:\/\/.*@/, "://****@"),
    containsPostgres: schema.includes('provider = "postgresql"'),
    containsSqlite: schema.includes('provider = "sqlite"'),
  });
}