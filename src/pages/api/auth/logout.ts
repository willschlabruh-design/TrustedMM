import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { clearAuthCookie } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  // Accept POST for logout
  if(req.method !== 'POST') return res.status(405).end();
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/token=([^;]+)/);
  if(match){
    const token = match[1];
    await prisma.session.deleteMany({ where: { token } });
  }
  clearAuthCookie(res);
  return res.status(200).json({ ok: true });
}
