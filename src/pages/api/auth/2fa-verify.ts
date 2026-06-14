import type { NextApiRequest, NextApiResponse } from 'next';
import speakeasy from 'speakeasy';
import { getUserFromRequest } from '../../../lib/session';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end();
  const { token: totp, secret } = req.body;
  if(!totp || !secret) return res.status(400).json({ error: 'Missing' });
  const ctx = await getUserFromRequest(req as any);
  if(!ctx || !ctx.user) return res.status(401).json({ error: 'Unauthorized' });
  const verified = speakeasy.totp.verify({ secret, encoding: 'base32', token: totp, window: 1 });
  if(!verified) return res.status(400).json({ error: 'Invalid code' });
  // persist secret and mark twoFA true
  await prisma.user.update({ where: { id: ctx.user.id }, data: { twoFA: true, twoFASecret: secret } });
  return res.status(200).json({ ok: true });
}
