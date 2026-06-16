import type { NextApiRequest, NextApiResponse } from 'next';
import { getAppUrl } from '../../../lib/auth-utils';
import { AuthAuditAction, logAuthAudit } from '../../../lib/audit-log';
import { syncVerifiedFromSupabase } from '../../../lib/profile-sync';
import { createSupabaseApiClient } from '../../../lib/supabase/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const redirect = (url: string) => {
    res.setHeader('Location', url);
    return res.status(302).end();
  };

  const appUrl = getAppUrl();
  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) return redirect(`${appUrl}/?error=Auth+not+configured`);

  const { code } = req.query;
  if (typeof code === 'string') {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return redirect(`${appUrl}/login?error=Invalid+verification+link`);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await syncVerifiedFromSupabase(user);
      logAuthAudit({
        req,
        userId: user.id,
        email: user.email ?? null,
        action: AuthAuditAction.EMAIL_VERIFICATION,
      });
      return redirect(`${appUrl}/`);
    }
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await syncVerifiedFromSupabase(user);
    logAuthAudit({
      req,
      userId: user.id,
      email: user.email ?? null,
      action: AuthAuditAction.EMAIL_VERIFICATION,
    });
    return redirect(`${appUrl}/`);
  }

  return redirect(`${appUrl}/login?error=Verification+session+not+found`);
}
