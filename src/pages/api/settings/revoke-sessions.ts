import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthAuditAction, logAuthAudit } from '../../../lib/audit-log';
import { clearLegacyTokenCookie } from '../../../lib/auth-utils';
import { createSupabaseApiClient } from '../../../lib/supabase/api';
import { requireAuth } from '../_helpers/requireAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const ctx = await requireAuth(req, res);
  if (!ctx) return;

  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) return res.status(500).json({ error: 'Auth not configured' });

  const { error } = await supabase.auth.signOut({ scope: 'global' });
  if (error) {
    await supabase.auth.signOut();
  }

  clearLegacyTokenCookie(res);

  logAuthAudit({
    req,
    userId: ctx.user.id,
    email: ctx.user.email,
    action: AuthAuditAction.SESSIONS_REVOKED,
  });

  return res.status(200).json({
    ok: true,
    message: 'All sessions have been revoked. You will need to sign in again.',
    signedOut: true,
  });
}
