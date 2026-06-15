import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { createSupabaseApiClient } from '../../../lib/supabase/api';
import { ensurePrismaProfile } from '../../../lib/profile-sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing' });

  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) return res.status(500).json({ error: 'Auth not configured' });

  const prismaUser = await prisma.user.findUnique({ where: { email } });

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  let profile = prismaUser ?? (await prisma.user.findUnique({ where: { id: data.user.id } }));
  if (!profile) {
    profile = await ensurePrismaProfile(data.user);
  }

  const isVerified = profile.verified || !!data.user.email_confirmed_at;
  if (!isVerified) {
    await supabase.auth.signOut();
    return res.status(403).json({
      error: 'Email not verified',
      requiresVerification: true,
      userId: profile.id,
    });
  }

  if (profile.role === 'ADMIN') {
    await supabase.auth.signOut();
    return res.status(403).json({
      error: 'Admin accounts require email verification',
      requiresEmailVerification: true,
      userId: profile.id,
      isAdmin: true,
    });
  }

  if (data.user.email_confirmed_at && !profile.verified) {
    await prisma.user.update({
      where: { id: profile.id },
      data: { verified: true },
    });
  }

  return res.status(200).json({ token: data.session.access_token });
}
