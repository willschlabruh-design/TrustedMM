import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthAuditAction, logAuthAudit } from '../../../lib/audit-log';
import { mapAuthError } from '../../../lib/password-reset';
import { createSupabaseApiClient } from '../../../lib/supabase/api';

const MIN_PASSWORD_LENGTH = 8;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Please enter a new password.' });
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  }

  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) return res.status(500).json({ error: 'Auth not configured' });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({
      error: 'This reset link has expired. Please request a new password reset.',
    });
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return res.status(400).json({ error: mapAuthError(error.message, 'reset') });
  }

  await supabase.auth.signOut();

  logAuthAudit({
    req,
    userId: user.id,
    email: user.email ?? null,
    action: AuthAuditAction.PASSWORD_RESET_COMPLETED,
  });

  return res.status(200).json({ ok: true, message: 'Password updated successfully.' });
}
