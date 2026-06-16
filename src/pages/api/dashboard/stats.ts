import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ctx = await getUserFromRequest(req, res);
    if (!ctx?.user) return res.status(401).json({ error: 'Unauthorized' });

    const userId = ctx.user.id;

    const userTradesWhere = {
      OR: [{ buyerId: userId }, { sellerId: userId }, { middlemanId: userId }],
    };

    const [activeTrades, completedTrades, pendingTrades, reviews, user] = await Promise.all([
      prisma.trade.count({
        where: { ...userTradesWhere, status: { not: 'COMPLETED' } },
      }),
      prisma.trade.count({
        where: { ...userTradesWhere, status: 'COMPLETED' },
      }),
      prisma.trade.count({
        where: { ...userTradesWhere, status: 'WAITING_FOR_MIDDLEMEN' },
      }),
      prisma.review.count({ where: { authorId: userId } }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, email: true, verified: true, role: true, createdAt: true },
      }),
    ]);

    return res.status(200).json({
      activeTrades,
      completedTrades,
      pendingTrades,
      reviews,
      user,
    });
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
