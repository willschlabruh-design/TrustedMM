import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  try{
    const activeTrades = await prisma.trade.count({ where: { status: { not: 'COMPLETED' } } });
    const completedTrades = await prisma.trade.count({ where: { status: 'COMPLETED' } });
    const reviews = await prisma.review.count();
    const totalValue = await prisma.trade.aggregate({ _sum: { value: true } });
    return res.status(200).json({ activeTrades, completedTrades, reviews, totalValue: totalValue._sum.value || 0 });
  }catch(err:any){
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}
