import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getOrCreateUserSettings } from '../../../lib/user-settings';
import { getUserFromRequest } from '../../../lib/session';

async function canViewProfile(viewerId: string | null, targetId: string, visibility: string) {
  if (viewerId === targetId) return true;
  if (visibility === 'PUBLIC') return true;
  if (visibility === 'PRIVATE') return false;

  if (!viewerId) return false;

  const sharedTrade = await prisma.trade.findFirst({
    where: {
      OR: [
        { buyerId: viewerId, sellerId: targetId },
        { buyerId: targetId, sellerId: viewerId },
        { buyerId: viewerId, middlemanId: targetId },
        { buyerId: targetId, middlemanId: viewerId },
        { sellerId: viewerId, middlemanId: targetId },
        { sellerId: targetId, middlemanId: viewerId },
      ],
    },
  });

  return !!sharedTrade;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid user ID' });

  const ctx = await getUserFromRequest(req, res);
  const viewerId = ctx?.user?.id ?? null;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      rating: true,
      verified: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user || user.role === 'DELETED' || user.role === 'BANNED') {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const settings = await getOrCreateUserSettings(id);
  const allowed = await canViewProfile(viewerId, id, settings.profileVisibility);
  if (!allowed) return res.status(404).json({ error: 'Profile not found' });

  const reviews = await prisma.review.findMany({
    where: {
      trade: {
        OR: [{ buyerId: id }, { sellerId: id }, { middlemanId: id }],
      },
    },
    include: {
      author: { select: { username: true } },
      trade: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return res.status(200).json({
    profile: {
      ...user,
      displayName: user.name || user.username,
    },
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      text: r.text,
      tradeTitle: r.trade?.title,
      authorUsername: r.author.username,
      createdAt: r.createdAt,
    })),
  });
}
