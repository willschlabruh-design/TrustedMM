import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { signJwt } from '../../../lib/auth';

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
  if(record.type !== 'admin_login') return _redirect(`/?error=Wrong+token+type`);
  
  const user = await prisma.user.findUnique({ where: { id: record.userId } });
  if(!user || user.role !== 'ADMIN') return _redirect(`/?error=Unauthorized`);
  
  // Create JWT token and session
  const jwtToken = signJwt({ sub: user.id, role: user.role });
  await prisma.session.create({ 
    data: { 
      userId: user.id, 
      token: jwtToken, 
      expiresAt: new Date(Date.now() + 7*24*60*60*1000) 
    } 
  });
  
  await prisma.verificationToken.delete({ where: { id: record.id } });
  res.setHeader('Set-Cookie', `token=${jwtToken}; HttpOnly; Path=/; Max-Age=${7*24*60*60}`);
  
  return _redirect('/');
}
