import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { AuthAuditAction, logAuthAudit } from '../../../lib/audit-log';
import { clearLegacyTokenCookie } from '../../../lib/auth-utils';
import { createSupabaseApiClient } from '../../../lib/supabase/api';
import { requireAuth } from '../_helpers/requireAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ctx = await requireAuth(req, res);
  if (!ctx) return;

  const userId = ctx.user.id;

  logAuthAudit({
    req,
    userId,
    email: ctx.user.email,
    action: AuthAuditAction.ACCOUNT_DELETION_REQUESTED,
  });

  try {
    const anonymized = {
      username: `deleted_user_${userId.slice(0, 8)}`,
      email: `deleted+${userId}@example.com`,
      password: '',
      role: 'DELETED',
      verified: false,
      name: null,
      twoFA: false,
      twoFASecret: null,
    } as const;

    await prisma.user.update({ where: { id: userId }, data: anonymized });

    const supabase = createSupabaseApiClient(req, res);
    if (supabase) {
      await supabase.auth.signOut({ scope: 'global' });
    }
    clearLegacyTokenCookie(res);

    return res.status(200).json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Server error';
    return res.status(500).json({ error: message });
  }
}
