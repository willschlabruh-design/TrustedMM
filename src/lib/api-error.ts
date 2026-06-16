import type { NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';

export function prismaErrorMessage(err: unknown): string | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2021') {
      const table = typeof err.meta?.table === 'string' ? err.meta.table : 'a required table';
      return `Database table missing (${table}). Run: npx prisma migrate deploy`;
    }
    if (err.code === 'P2022') {
      const column = typeof err.meta?.column === 'string' ? err.meta.column : 'a required column';
      return `Database schema out of date (${column}). Run: npx prisma migrate deploy`;
    }
  }
  return null;
}

export function sendApiError(
  res: NextApiResponse,
  status: number,
  error: string,
  err?: unknown,
  context?: string
) {
  const prismaHint = err ? prismaErrorMessage(err) : null;
  const details =
    err instanceof Error
      ? err.message
      : typeof err === 'string'
        ? err
        : undefined;

  if (context) {
    console.error(`[${context}] ${error}`, err);
  } else {
    console.error(error, err);
  }

  return res.status(status).json({
    error: prismaHint ?? error,
    ...(details && details !== (prismaHint ?? error) ? { details } : {}),
  });
}
