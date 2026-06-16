import type { NextApiRequest, NextApiResponse } from 'next';
import { resolveAdminRole } from './admin-grant';
import { prisma } from './prisma';
import { ensurePrismaProfile } from './profile-sync';
import { createSupabaseApiClient } from './supabase/api';

type AuthContext = {
  user: NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>>;
  token: string | null;
};

export async function getUserFromRequest(req: any, res?: any): Promise<AuthContext | null> {
  const apiReq = req as NextApiRequest;
  if (!apiReq?.headers) return null;

  const supabase = createSupabaseApiClient(apiReq, res as NextApiResponse | undefined);
  if (!supabase) return null;

  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    if (error || !supabaseUser) return null;

    let user = await prisma.user.findUnique({ where: { id: supabaseUser.id } });
    if (!user) {
      user = await ensurePrismaProfile(supabaseUser);
    } else {
      const role = resolveAdminRole(user.email, user.username, user.role);
      if (role !== user.role) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role },
        });
      }
    }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? null;

    return { user, token };
  } catch {
    return null;
  }
}
