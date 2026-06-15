import type { NextApiRequest, NextApiResponse } from 'next';
import { getAppUrl } from '../../../lib/auth-utils';
import { createSupabaseApiClient } from '../../../lib/supabase/api';
import { prisma } from '../../../lib/prisma';
import { syncVerifiedFromSupabase } from '../../../lib/profile-sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const redirect = (url: string) => {
    res.setHeader('Location', url);
    return res.status(302).end();
  };

  const appUrl = getAppUrl();

  if (req.query.token) {
    return redirect(`${appUrl}/login?error=Admin+verification+links+have+been+updated.+Please+sign+in+again`);
  }

  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) return redirect(`${appUrl}/?error=Auth+not+configured`);

  const { code } = req.query;
  if (typeof code === 'string') {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return redirect(`${appUrl}/login?error=Invalid+admin+verification+link`);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect(`${appUrl}/login?error=Unauthorized`);

    const profile = await prisma.user.findUnique({ where: { id: user.id } });
    if (!profile || profile.role !== 'ADMIN') {
      await supabase.auth.signOut();
      return redirect(`${appUrl}/login?error=Unauthorized`);
    }

    await syncVerifiedFromSupabase(user);
    return redirect(`${appUrl}/dashboard`);
  }

  return redirect(`${appUrl}/auth/callback`);
}
