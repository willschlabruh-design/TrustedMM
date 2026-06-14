import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { requireAuth, requireRole } from '../_helpers/requireAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireAuth(req, res);
  if (!ctx) return;
  // Allow users with ADMIN role
  if (!requireRole(ctx, ['ADMIN'])) return res.status(403).json({ error: 'Forbidden' });

  const users = await prisma.user.findMany({
    select: { id: true, email: true, username: true, role: true, verified: true, createdAt: true }
  });

  return res.status(200).json({ users });
}
