import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end();
  const { email, name, message } = req.body || {};
  if(!email || !message) return res.status(400).json({ error: 'Missing email or message' });

  // Find all admins
  const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
  const payload = JSON.stringify({ email, name: name || null, message });

  const creates = admins.map(a => prisma.notification.create({ data: { userId: a.id, type: 'contact_message', payload } }));
  await Promise.all(creates);

  return res.status(201).json({ ok: true });
}
