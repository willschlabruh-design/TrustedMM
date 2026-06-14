import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, requireRole } from '../_helpers/requireAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const ctx = await requireAuth(req, res);
  if (!ctx) return;
  if (!requireRole(ctx, ['ADMIN'])) return res.status(403).json({ error: 'Forbidden' });

  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return res.status(404).json({ error: 'User not found' });

  const updated = await prisma.user.update({ where: { id: userId }, data: { role: 'USER' } });

  await prisma.notification.create({ data: { userId: updated.id, type: 'unbanned', payload: JSON.stringify({ reason: 'Unbanned by platform middleman' }) } });

  return res.status(200).json({ ok: true, user: { id: updated.id, username: updated.username, role: updated.role } });
}
