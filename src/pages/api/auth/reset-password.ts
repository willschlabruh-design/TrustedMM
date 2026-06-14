import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { hashPassword } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end();
  const { token, password } = req.body;
  if(!token || !password) return res.status(400).json({ error: 'Missing' });
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if(!record || record.type !== 'password_reset') return res.status(400).json({ error: 'Invalid token' });
  if(record.expiresAt < new Date()){
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return res.status(410).json({ error: 'Expired' });
  }
  const hashed = await hashPassword(password);
  await prisma.user.update({ where: { id: record.userId }, data: { password: hashed } });
  await prisma.verificationToken.deleteMany({ where: { userId: record.userId, type: 'password_reset' } });
  return res.status(200).json({ ok: true });
}
