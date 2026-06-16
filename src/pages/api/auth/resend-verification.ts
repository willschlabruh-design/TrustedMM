import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getAuthCallbackUrl } from '../../../lib/auth-utils';
import { AuthAuditAction, logAuthAudit } from '../../../lib/audit-log';
import { createSupabaseApiClient } from '../../../lib/supabase/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, email } = req.body;
  if (!userId && !email) return res.status(400).json({ error: 'Missing userId or email' });

  let user;
  if (userId) {
    user = await prisma.user.findUnique({ where: { id: userId } });
  } else {
    user = await prisma.user.findUnique({ where: { email } });
  }

  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.verified) return res.status(200).json({ ok: true, message: 'Email already verified' });

  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) return res.status(500).json({ error: 'Auth not configured' });

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: user.email,
    options: {
      emailRedirectTo: getAuthCallbackUrl(),
    },
  });

  if (error) {
    console.error('Failed to resend verification email:', error);
    return res.status(500).json({ error: 'Unable to send verification email. Please try again later.' });
  }

  logAuthAudit({
    req,
    userId: user.id,
    email: user.email,
    action: AuthAuditAction.EMAIL_RESEND_REQUESTED,
  });

  return res.status(200).json({ ok: true, message: 'A new verification email has been sent.' });
}
