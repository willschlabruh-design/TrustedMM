import type { User as SupabaseUser } from '@supabase/supabase-js';
import { prisma } from './prisma';

function baseUsernameFromEmail(email: string) {
  const base = email.split('@')[0].replace(/[^a-z0-9_-]/gi, '').slice(0, 12);
  return base || 'user';
}

async function uniqueUsername(email: string, preferred?: string) {
  const base = (preferred || baseUsernameFromEmail(email)).slice(0, 20) || 'user';
  let username = base;
  let suffix = 0;

  while (await prisma.user.findUnique({ where: { username } })) {
    suffix += 1;
    username = `${base}${suffix}`;
  }

  return username;
}

export async function ensurePrismaProfile(supabaseUser: SupabaseUser) {
  const email = supabaseUser.email ?? '';
  const metadata = supabaseUser.user_metadata ?? {};
  const preferredUsername =
    typeof metadata.username === 'string' ? metadata.username : undefined;
  const username = await uniqueUsername(email, preferredUsername);

  return prisma.user.upsert({
    where: { id: supabaseUser.id },
    create: {
      id: supabaseUser.id,
      email,
      username,
      password: '',
      verified: !!supabaseUser.email_confirmed_at,
    },
    update: {
      email,
      verified: !!supabaseUser.email_confirmed_at,
    },
  });
}
