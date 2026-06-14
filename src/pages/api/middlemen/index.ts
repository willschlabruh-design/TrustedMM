import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  try{
    const { q, sort = 'rating', verified } = req.query;
    const where: any = { role: 'ADMIN' };
    if(q && typeof q === 'string') where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }];
    if(verified === 'true') where.verified = true;
    const orderBy: any = {};
    if(sort === 'rating') orderBy.rating = 'desc';
    if(sort === 'trades') orderBy.createdAt = 'desc';
    const middlemen = await prisma.user.findMany({ where, orderBy, select: { id:true, name:true, avatarUrl:true, rating:true, createdAt:true, verified:true } , take: 50 });
    return res.status(200).json({ middlemen });
  }catch(err:any){ console.error(err); res.status(500).json({ error: 'Server error' }); }
}
