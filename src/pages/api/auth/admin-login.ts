import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getAuthCallbackUrl } from '../../../lib/auth-utils';
import { createSupabaseApiClient } from '../../../lib/supabase/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Unauthorized' });

  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) return res.status(500).json({ error: 'Auth not configured' });

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
      },
    });

    if (error) {
      console.error('Admin login error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ ok: true, message: 'Verification email sent' });
  } catch (e) {
    console.error('Admin login error:', e);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
