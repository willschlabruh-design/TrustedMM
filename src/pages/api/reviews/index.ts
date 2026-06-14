import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: true, trade: true },
    take: 50
  });

  return res.status(200).json({ reviews });
}
