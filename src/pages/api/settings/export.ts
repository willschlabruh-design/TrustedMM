import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { AuthAuditAction, logAuthAudit } from '../../../lib/audit-log';
import { getOrCreateUserSettings, serializeUserSettings } from '../../../lib/user-settings';
import { requireAuth } from '../_helpers/requireAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const ctx = await requireAuth(req, res);
  if (!ctx) return;

  const userId = ctx.user.id;

  const [user, settings, trades, reviews, notifications, auditLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        rating: true,
        createdAt: true,
      },
    }),
    getOrCreateUserSettings(userId),
    prisma.trade.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }, { middlemanId: userId }],
      },
      select: {
        id: true,
        title: true,
        status: true,
        platform: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.review.findMany({
      where: { authorId: userId },
      select: { id: true, rating: true, text: true, tradeId: true, createdAt: true },
    }),
    prisma.notification.findMany({
      where: { userId },
      select: { id: true, type: true, read: true, createdAt: true },
      take: 100,
    }),
    prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, action: true, ipAddress: true, createdAt: true },
    }),
  ]);

  logAuthAudit({
    req,
    userId,
    email: ctx.user.email,
    action: AuthAuditAction.DATA_EXPORT_REQUESTED,
  });

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    profile: user,
    settings: serializeUserSettings(settings),
    trades,
    reviews,
    notifications,
    securityEvents: auditLogs,
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="trustedmm-data-${userId.slice(0, 8)}.json"`
  );

  return res.status(200).json(exportPayload);
}
