import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, requireRole } from '../_helpers/requireAuth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const ctx = await requireAuth(req, res as any);
  if(!ctx) return;
  if(!requireRole(ctx, ['ADMIN'])) return res.status(403).json({ error: 'Forbidden' });

  const trades = await prisma.trade.findMany({ include: { buyer: true, seller: true, middleman: true } });
  return res.status(200).json({ trades });
}
