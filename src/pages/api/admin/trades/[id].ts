import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, requireRole } from '../../_helpers/requireAuth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query;
  if(!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });
  const ctx = await requireAuth(req, res as any);
  if(!ctx || !ctx.user) return;

  // Load the trade early so we can authorize based on the trade's assigned middleman
  const tradeBasic = await prisma.trade.findUnique({ where: { id } });
  if(!tradeBasic) return res.status(404).json({ error: 'Not found' });

  const isAdmin = ctx.user.role === 'ADMIN';
  // After merging roles, platform middlemen are admins; allow assigned middleman (by id) as well
  const isAssignedMiddleman = !!(tradeBasic.middlemanId && ctx.user.id === tradeBasic.middlemanId);
  if(!(isAdmin || isAssignedMiddleman)) return res.status(403).json({ error: 'Forbidden' });

  if(req.method === 'GET'){
    const trade = await prisma.trade.findUnique({ where: { id }, include: { buyer: true, seller: true, middleman: true, messages: { include: { sender: true } }, files: true } });
    if(!trade) return res.status(404).json({ error: 'Not found' });
    return res.status(200).json({ trade });
  }

  if(req.method === 'POST'){
    const { action } = req.body || {};
    if(action === 'complete'){
      // mark trade completed
      const updated = await prisma.trade.update({ where: { id }, data: { status: 'COMPLETED' } });
      // find room if exists
      const room = await prisma.room.findFirst({ where: { tradeId: id } });
      // notify buyer and seller to leave reviews (payload includes tradeId)
      const notifs: any[] = [];
      if(updated.buyerId) notifs.push({ userId: updated.buyerId, type: 'trade_completed', payload: JSON.stringify({ tradeId: id }) });
      if(updated.sellerId) notifs.push({ userId: updated.sellerId, type: 'trade_completed', payload: JSON.stringify({ tradeId: id }) });
      if(notifs.length) await prisma.notification.createMany({ data: notifs });
      return res.status(200).json({ ok: true, trade: updated, roomId: room?.id ?? null });
    }

    if(action === 'deleteRoom'){
      // Delete room and associated data
      const room = await prisma.room.findFirst({ where: { tradeId: id } });
      if(!room) return res.status(404).json({ error: 'Room not found' });
      await prisma.message.deleteMany({ where: { roomId: room.id } });
      await prisma.roomMember.deleteMany({ where: { roomId: room.id } });
      await prisma.room.delete({ where: { id: room.id } });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Unknown action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
