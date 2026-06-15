import type { NextApiRequest, NextApiResponse } from 'next';
import { syncVerifiedFromSupabase } from '../../../lib/profile-sync';
import { createSupabaseApiClient } from '../../../lib/supabase/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) return res.status(500).json({ error: 'Auth not configured' });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

  const profile = await syncVerifiedFromSupabase(user);
  const { password, twoFASecret, ...safeUser } = profile as any;

  return res.status(200).json({ ok: true, user: safeUser });
}
