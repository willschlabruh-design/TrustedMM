import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../_helpers/requireAuth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query;
  if(!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });
  const ctx = await requireAuth(req, res as any);
  if(!ctx || !ctx.user) return;
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action } = req.body || {};
  if(action === 'deleteRoom'){
    // only admins
    if(ctx.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admins only' });
    const room = await prisma.room.findUnique({ where: { id } });
    if(!room) return res.status(404).json({ error: 'Room not found' });
    await prisma.message.deleteMany({ where: { roomId: room.id } });
    await prisma.roomMember.deleteMany({ where: { roomId: room.id } });
    await prisma.room.delete({ where: { id: room.id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Unknown action' });
}
