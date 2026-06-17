import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getUserFromRequest } from '../../../lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ctx = await getUserFromRequest(req as any);
  if (!ctx || !ctx.user) return res.status(401).json({ error: 'Unauthorized' });
  if (ctx.user.role !== 'ADMIN') return res.status(403).json({ error: 'Only admins can accept middleman roles' });

  let tradeId = req.body.tradeId;
  if (!tradeId) return res.status(400).json({ error: 'Missing tradeId' });


  // Check if trade exists
  let trade = await prisma.trade.findUnique({ where: { id: tradeId } });
  // If trade not found, maybe the client passed a roomId — try to resolve
  if(!trade){
    const room = await prisma.room.findUnique({ where: { id: tradeId }, include: { trade: true } });
    if(room && room.tradeId){
      trade = room.trade || await prisma.trade.findUnique({ where: { id: room.tradeId } });
      if(trade) tradeId = trade.id;
    }
  }
  if (!trade) return res.status(404).json({ error: 'Trade not found (checked tradeId and roomId)' });

  // Atomically assign this admin as middleman only if none assigned yet (prevents race conditions)
  const assign = await prisma.trade.updateMany({
    where: { id: tradeId, OR: [{ middlemanId: null }, { middlemanId: '' }] },
    data: { middlemanId: ctx.user.id, status: 'ACTIVE' }
  });
  if(assign.count === 0){
    // Someone else already claimed or middlemanId was set — return diagnostic info
    const current = await prisma.trade.findUnique({ where: { id: tradeId } });
    console.error('accept-middleman: assign failed', { tradeId, attemptedBy: ctx.user.id, current });
    return res.status(400).json({ error: 'Trade already has a middleman or is not accepting middlemen', trade: current });
  }

  const updatedTrade = await prisma.trade.findUnique({ where: { id: tradeId } });

  // Add admin to the room
  const room = await prisma.room.findFirst({ where: { tradeId } });
  if (room) {
    try{
      await prisma.roomMember.create({ data: { roomId: room.id, userId: ctx.user.id } });
    }catch(e:any){
      // ignore unique constraint errors for existing membership
      console.warn('accept-middleman: could not create roomMember (maybe already exists)', e?.message || e);
    }

    try{
      // Add a message that middleman has joined
      await prisma.message.create({ data: { roomId: room.id, senderId: ctx.user.id, body: `✅ TrustedMM platform oversight assigned — ${ctx.user.username || ctx.user.email} has joined the room` } });
    }catch(e:any){ console.error('accept-middleman: failed to create join message', e); }
  }

  // Mark all "middleman_needed" notifications for this trade as read for all admins
  await prisma.notification.updateMany({
    where: {
      type: 'middleman_needed',
      payload: { contains: tradeId }
    },
    data: { read: true }
  });

  return res.status(200).json({ ok: true, trade: updatedTrade });
}
