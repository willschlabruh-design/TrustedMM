import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const { token } = req.query;
  const _redirect = (url: string) => { res.setHeader('Location', url); return res.status(302).end(); };
  if(!token || typeof token !== 'string') return _redirect(`/?error=Missing+token`);
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if(!record) return _redirect(`/?error=Invalid+token`);
  if(record.expiresAt < new Date()){
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return _redirect(`/?error=Token+expired`);
  }
  if(record.type !== 'email_verification') return _redirect(`/?error=Wrong+token+type`);
  await prisma.user.update({ where: { id: record.userId }, data: { verified: true } });
  await prisma.verificationToken.delete({ where: { id: record.id } });
  return _redirect(`/?success=Email+verified`);
}
