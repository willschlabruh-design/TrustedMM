import type { NextApiRequest, NextApiResponse } from 'next';
import speakeasy from 'speakeasy';
import { getUserFromRequest } from '../../../lib/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  if(req.method !== 'POST') return res.status(405).end();
  const ctx = await getUserFromRequest(req as any);
  if(!ctx || !ctx.user) return res.status(401).json({ error: 'Unauthorized' });
  const secret = speakeasy.generateSecret({ name: `MiddleMan (${ctx.user.email})` });
  // return secret to client to confirm with TOTP app; do not persist yet
  return res.status(200).json({ base32: secret.base32, otpauth_url: secret.otpauth_url });
}
