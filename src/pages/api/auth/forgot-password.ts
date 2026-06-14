import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { generateToken } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end();
  const { email } = req.body;
  if(!email) return res.status(400).json({ error: 'Missing email' });
  const user = await prisma.user.findUnique({ where: { email } });
  if(!user) return res.status(200).json({ ok: true });
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
  await prisma.verificationToken.create({ data: { token, type: 'password_reset', userId: user.id, expiresAt } });
  const link = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  // In production send email; return link for dev
  return res.status(200).json({ ok: true, resetLink: link });
}
