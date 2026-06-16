import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { sendApiError } from '../../../lib/api-error';
import { AUTH_AUDIT_ACTION_LABELS } from '../../../lib/audit-log';
import { requireAuth } from '../_helpers/requireAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const ctx = await requireAuth(req, res);
  if (!ctx) return;

  try {
    const logs = await prisma.auditLog.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        action: true,
        ipAddress: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      logs: logs.map((log) => ({
        ...log,
        label:
          AUTH_AUDIT_ACTION_LABELS[log.action as keyof typeof AUTH_AUDIT_ACTION_LABELS] ?? log.action,
      })),
      currentSession: {
        active: true,
        ipAddress: logs[0]?.ipAddress ?? null,
        lastLogin: logs.find((l) => l.action === 'LOGIN_SUCCESS')?.createdAt ?? null,
      },
    });
  } catch (err) {
    return sendApiError(res, 500, 'Failed to load security log.', err, 'GET /api/settings/security-log');
  }
}
