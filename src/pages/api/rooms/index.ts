import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../_helpers/requireAuth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const ctx = await requireAuth(req, res as any);
  if(!ctx) return;
  if(!ctx.user) return res.status(403).json({ error: 'Forbidden' });

  const rooms = await prisma.room.findMany({
    where: { members: { some: { userId: ctx.user.id } } },
    include: { trade: true, members: { include: { user: true } }, messages: { include: { sender: true }, orderBy: { createdAt: 'desc' }, take: 1 } },
    orderBy: { createdAt: 'desc' }
  });

  // sort rooms by most recent message (or room createdAt if no messages)
  rooms.sort((a: any, b: any) => {
    const aDate = a.messages?.[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : new Date(a.createdAt).getTime();
    const bDate = b.messages?.[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : new Date(b.createdAt).getTime();
    return bDate - aDate;
  });

  return res.status(200).json({ rooms });
}
