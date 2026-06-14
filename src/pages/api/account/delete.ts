import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../_helpers/requireAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await requireAuth(req, res as any);
  if(!ctx || !ctx.user) return res.status(401).json({ error: 'Unauthorized' });

  const userId = ctx.user.id;
  try{
    // Anonymize account instead of hard delete to avoid FK problems
    const anonymized = {
      username: `deleted_user_${userId}`,
      email: `deleted+${userId}@example.com`,
      password: '',
      role: 'DELETED',
      verified: false,
    } as any;

    await prisma.user.update({ where: { id: userId }, data: anonymized });

    return res.status(200).json({ ok: true });
  }catch(e:any){
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
