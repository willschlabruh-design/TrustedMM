import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth, requireRole } from '../_helpers/requireAuth';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await requireAuth(req, res as any);
  if(!ctx) return;
  if(!ctx || !ctx.user) return res.status(403).json({ error: 'Forbidden' });
  if(!requireRole(ctx, ['ADMIN'])) return res.status(403).json({ error: 'Forbidden' });

  const { userId, role } = req.body || {};
  if(!userId || typeof role !== 'string') return res.status(400).json({ error: 'Missing userId or role' });

  try{
    const updated = await prisma.user.update({ where: { id: userId }, data: { role } });
    await prisma.notification.create({ data: { userId: updated.id, type: 'role_changed', payload: JSON.stringify({ role }) } });
    return res.status(200).json({ ok: true, user: { id: updated.id, username: updated.username, role: updated.role } });
  }catch(e:any){
    return res.status(500).json({ error: e.message || 'Server error' });
  }
}
