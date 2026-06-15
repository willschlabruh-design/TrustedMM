import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { createSupabaseAdminClient } from '../../../lib/supabase/admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'Forbidden in production' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' });
  }

  const body = req.body || {};
  const email = typeof body.email === 'string' ? body.email : 'william.schlanbusch@gmail.com';
  let username = typeof body.username === 'string' ? body.username : 'platform_middleman';

  const passwordPlain = Math.random().toString(36).slice(2, 10) + 'A1!';

  let uniqueUsername = username;
  let counter = 1;
  while (true) {
    const other = await prisma.user.findUnique({ where: { username: uniqueUsername } });
    if (!other) break;
    if (other.email === email) break;
    uniqueUsername = `${username}${counter}`;
    counter++;
  }

  const existingProfile = await prisma.user.findUnique({ where: { email } });
  let authUserId = existingProfile?.id;

  if (!authUserId) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: passwordPlain,
      email_confirm: true,
      user_metadata: { username: uniqueUsername },
    });

    if (error || !data.user) {
      return res.status(500).json({ error: error?.message || 'Failed to create Supabase user' });
    }

    authUserId = data.user.id;
  } else {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
      password: passwordPlain,
      email_confirm: true,
      user_metadata: { username: uniqueUsername },
    });

    if (error) {
      return res.status(500).json({ error: error.message || 'Failed to update Supabase user' });
    }
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      id: authUserId,
      username: uniqueUsername,
      role: 'ADMIN',
      password: '',
      verified: true,
    },
    create: {
      id: authUserId,
      email,
      username: uniqueUsername,
      password: '',
      role: 'ADMIN',
      verified: true,
    },
  });

  return res.status(200).json({
    ok: true,
    email: user.email,
    username: user.username,
    password: passwordPlain,
  });
}
