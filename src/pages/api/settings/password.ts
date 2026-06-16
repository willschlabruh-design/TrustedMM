import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthAuditAction, logAuthAudit } from '../../../lib/audit-log';
import { getPasswordStrength } from '../../../lib/password-strength';
import { createSupabaseApiClient } from '../../../lib/supabase/api';
import { requireAuth } from '../_helpers/requireAuth';

const MIN_PASSWORD_LENGTH = 8;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const ctx = await requireAuth(req, res);
  if (!ctx) return;

  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword || typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return res.status(400).json({ error: 'Current and new password are required.' });
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` });
  }

  const strength = getPasswordStrength(newPassword);
  if (strength.score === 'weak') {
    return res.status(400).json({ error: 'Choose a stronger password with mixed characters.' });
  }

  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) return res.status(500).json({ error: 'Auth not configured' });

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: ctx.user.email,
    password: currentPassword,
  });

  if (verifyError) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  logAuthAudit({
    req,
    userId: ctx.user.id,
    email: ctx.user.email,
    action: AuthAuditAction.PASSWORD_CHANGED,
  });

  return res.status(200).json({ ok: true, message: 'Password updated successfully.' });
}
