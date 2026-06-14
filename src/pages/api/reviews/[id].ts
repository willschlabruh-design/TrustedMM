import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../_helpers/requireAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { id } = req.query;
  if(!id || typeof id !== 'string') return res.status(400).json({ error: 'Missing id' });

  if(req.method === 'DELETE'){
    const ctx = await requireAuth(req, res as any);
    if(!ctx || !ctx.user) return res.status(401).json({ error: 'Unauthorized' });
    const review = await prisma.review.findUnique({ where: { id } });
    if(!review) return res.status(404).json({ error: 'Not found' });
    // Only ADMIN may delete reviews
    if(ctx.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
    await prisma.review.delete({ where: { id } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
