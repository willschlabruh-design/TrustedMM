import type { NextApiRequest, NextApiResponse } from 'next';
import { getResetPasswordUrl } from '../../../lib/auth-utils';
import { isValidEmail } from '../../../lib/password-reset';
import { createSupabaseApiClient } from '../../../lib/supabase/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) return res.status(500).json({ error: 'Auth not configured' });

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: getResetPasswordUrl(),
  });

  if (error) {
    console.error('Failed to send password reset email:', error);
  }

  return res.status(200).json({
    ok: true,
    message: 'If an account exists for that email, a reset link has been sent.',
  });
}
