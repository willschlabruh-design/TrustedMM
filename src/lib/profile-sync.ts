import type { User as SupabaseUser } from '@supabase/supabase-js';
import { resolveAdminRole } from './admin-grant';
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

type CreateProfileInput = {
  id: string;
  email: string;
  username: string;
  verified?: boolean;
  role?: string;
};

export async function createPrismaProfile(input: CreateProfileInput) {
  const role = resolveAdminRole(input.email, input.username, input.role ?? 'USER');

  return prisma.user.create({
    data: {
      id: input.id,
      email: input.email,
      username: input.username,
      password: '',
      verified: input.verified ?? false,
      role,
    },
  });
}

export async function ensurePrismaProfile(supabaseUser: SupabaseUser) {
  const email = supabaseUser.email ?? '';
  const metadata = supabaseUser.user_metadata ?? {};
  const preferredUsername =
    typeof metadata.username === 'string' ? metadata.username : undefined;
  const username = await uniqueUsername(email, preferredUsername);

  const existing = await prisma.user.findUnique({ where: { id: supabaseUser.id } });
  const role = resolveAdminRole(email, existing?.username ?? username, existing?.role ?? 'USER');

  return prisma.user.upsert({
    where: { id: supabaseUser.id },
    create: {
      id: supabaseUser.id,
      email,
      username,
      password: '',
      verified: !!supabaseUser.email_confirmed_at,
      role,
    },
    update: {
      email,
      verified: !!supabaseUser.email_confirmed_at,
      role,
    },
  });
}

export async function syncVerifiedFromSupabase(supabaseUser: SupabaseUser) {
  const existing = await prisma.user.findUnique({ where: { id: supabaseUser.id } });
  if (!existing) {
    return ensurePrismaProfile(supabaseUser);
  }

  const role = resolveAdminRole(existing.email, existing.username, existing.role);
  const verified = !!supabaseUser.email_confirmed_at || existing.verified;

  if (!supabaseUser.email_confirmed_at && existing.verified && role === existing.role) {
    return existing;
  }

  return prisma.user.update({
    where: { id: supabaseUser.id },
    data: {
      verified,
      role,
    },
  });
}

export async function applyAdminGrantByIdentity() {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { equals: 'willschla', mode: 'insensitive' } },
        { email: { equals: 'william.schlanbusch@gmail.com', mode: 'insensitive' } },
      ],
    },
  });

  const updates = await Promise.all(
    users.map((user) => {
      const role = resolveAdminRole(user.email, user.username, user.role);
      if (role === user.role) return user;
      return prisma.user.update({
        where: { id: user.id },
        data: { role },
      });
    })
  );

  return updates;
}
