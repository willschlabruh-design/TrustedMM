import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../_helpers/requireAuth';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query;
  if(!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });
  const ctx = await requireAuth(req, res as any);
  if(!ctx) return;
  if(!ctx.user) return res.status(403).json({ error: 'Forbidden' });

  if(req.method === 'POST'){
    const { rating, text } = req.body || {};
    if(typeof rating !== 'number' || rating < 1 || rating > 5) return res.status(400).json({ error: 'Invalid rating' });
    // ensure user is part of the trade (buyer or seller)
    const trade = await prisma.trade.findUnique({ where: { id } });
    if(!trade) return res.status(404).json({ error: 'Trade not found' });
    if(trade.buyerId !== ctx.user.id && trade.sellerId !== ctx.user.id) return res.status(403).json({ error: 'Forbidden' });

    const review = await prisma.review.create({ data: { authorId: ctx.user.id, tradeId: id, rating: Math.round(rating), text: text || '' } });
    return res.status(201).json({ ok: true, review });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
