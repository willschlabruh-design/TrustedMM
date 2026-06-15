import type { NextApiRequest, NextApiResponse } from 'next';
import { createSupabaseApiClient } from '../../../lib/supabase/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Missing password' });

  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) return res.status(500).json({ error: 'Auth not configured' });

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid or expired reset session. Please request a new reset link.' });
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return res.status(400).json({ error: error.message || 'Failed to reset password' });
  }

  return res.status(200).json({ ok: true });
}
