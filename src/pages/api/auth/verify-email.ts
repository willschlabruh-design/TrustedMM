import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { token } = req.query;
  if(!token || typeof token !== 'string') return res.status(400).json({ error: 'Missing token' });
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if(!record) return res.status(404).json({ error: 'Invalid token' });
  if(record.expiresAt < new Date()){
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return res.status(410).json({ error: 'Token expired' });
  }
  if(record.type !== 'email_verification') return res.status(400).json({ error: 'Wrong token type' });
  await prisma.user.update({ where: { id: record.userId }, data: { verified: true } });
  await prisma.verificationToken.delete({ where: { id: record.id } });
  return res.status(200).json({ ok: true });
}
