import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { comparePassword, signJwt } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end();
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'Missing' });
  const user = await prisma.user.findUnique({ where: { email } });
  if(!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await comparePassword(password, user.password);
  if(!ok) return res.status(401).json({ error: 'Invalid credentials' });

  if(!user.verified) return res.status(403).json({ error: 'Email not verified', requiresVerification: true, userId: user.id });

  // ADMIN USERS MUST USE 2FA
  if(user.role === 'ADMIN') {
    return res.status(403).json({ 
      error: 'Admin accounts require email verification', 
      requiresEmailVerification: true, 
      userId: user.id,
      isAdmin: true 
    });
  }

  const token = signJwt({ sub: user.id, role: user.role });
  // persist session
  await prisma.session.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 7*24*60*60*1000) } });
  res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${7*24*60*60}`);
  return res.status(200).json({ token });
}
