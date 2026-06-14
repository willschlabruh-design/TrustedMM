import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../_helpers/requireAuth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const ctx = await requireAuth(req, res as any);
  if(!ctx) return;

  if(req.method === 'GET'){
    if(!ctx.user) return res.status(403).json({ error: 'Forbidden' });
    const list = await prisma.notification.findMany({ where: { userId: ctx.user.id, read: false }, orderBy: { createdAt: 'desc' }, take: 50 });
    return res.status(200).json({ notifications: list });
  }

  if(req.method === 'POST'){
    const { id } = req.body || {};
    if(!id) return res.status(400).json({ error: 'Missing id' });
    await prisma.notification.update({ where: { id }, data: { read: true } });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
