import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const ctx = await getUserFromRequest(req as any);
  if(!ctx || !ctx.user) return res.status(200).json({ user: null });
  const { password, twoFASecret, ...user } = ctx.user as any;
  return res.status(200).json({ user });
}
