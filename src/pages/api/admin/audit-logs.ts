import type { NextApiRequest, NextApiResponse } from 'next';
import { AUTH_AUDIT_ACTION_LABELS } from '../../../lib/audit-log';
import { prisma } from '../../../lib/prisma';
import { requireAuth, requireRole } from '../_helpers/requireAuth';

const AUTH_ACTIONS = Object.keys(AUTH_AUDIT_ACTION_LABELS);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const ctx = await requireAuth(req, res);
  if (!ctx) return;
  if (!requireRole(ctx, ['ADMIN'])) return res.status(403).json({ error: 'Forbidden' });

  const limitRaw = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 100;
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 500) : 100;

  const actionFilter =
    typeof req.query.action === 'string' && AUTH_ACTIONS.includes(req.query.action)
      ? req.query.action
      : undefined;

  const logs = await prisma.auditLog.findMany({
    where: actionFilter ? { action: actionFilter } : { action: { in: AUTH_ACTIONS } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true,
      userId: true,
      email: true,
      ipAddress: true,
      action: true,
      createdAt: true,
    },
  });

  return res.status(200).json({
    logs: logs.map((log) => ({
      ...log,
      label: AUTH_AUDIT_ACTION_LABELS[log.action as keyof typeof AUTH_AUDIT_ACTION_LABELS] ?? log.action,
    })),
  });
}
