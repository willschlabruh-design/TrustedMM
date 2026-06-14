import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../_helpers/requireAuth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query;
  if(!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });
  const ctx = await requireAuth(req, res as any);
  if(!ctx) return;
  if(!ctx.user) return res.status(403).json({ error: 'Forbidden' });
  const userId = ctx.user.id;

  if(req.method === 'POST'){
    const { body } = req.body || {};
    if(!body) return res.status(400).json({ error: 'Missing body' });
    // ensure user is member of room
    const member = await prisma.roomMember.findFirst({ where: { roomId: id, userId: userId } });
    if(!member) return res.status(403).json({ error: 'Forbidden' });

    const msg = await prisma.message.create({ data: { roomId: id, senderId: userId, body } });
    // create notifications for other room members
    const members = await prisma.roomMember.findMany({ where: { roomId: id } });
    const notifs = members.filter(m => m.userId !== userId).map(m => ({ userId: m.userId, type: 'message', payload: JSON.stringify({ roomId: id, messageId: msg.id, senderId: userId }) }));
    if(notifs.length) await prisma.notification.createMany({ data: notifs });

    return res.status(201).json({ ok: true, message: msg });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
