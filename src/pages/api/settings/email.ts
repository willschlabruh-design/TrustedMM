import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthAuditAction, logAuthAudit } from '../../../lib/audit-log';
import { isValidEmailFormat } from '../../../lib/password-strength';
import { createSupabaseApiClient } from '../../../lib/supabase/api';
import { requireAuth } from '../_helpers/requireAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const ctx = await requireAuth(req, res);
  if (!ctx) return;

  const { email, password } = req.body ?? {};
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Email and current password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmailFormat(normalizedEmail)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }

  if (normalizedEmail === ctx.user.email.toLowerCase()) {
    return res.status(400).json({ error: 'That is already your email address.' });
  }

  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) return res.status(500).json({ error: 'Auth not configured' });

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: ctx.user.email,
    password,
  });

  if (verifyError) {
    return res.status(400).json({ error: 'Password is incorrect.' });
  }

  const { error: updateError } = await supabase.auth.updateUser({ email: normalizedEmail });
  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  logAuthAudit({
    req,
    userId: ctx.user.id,
    email: normalizedEmail,
    action: AuthAuditAction.EMAIL_CHANGED,
  });

  return res.status(200).json({
    ok: true,
    message: 'Verification email sent to your new address. Confirm the link to complete the change.',
  });
}
