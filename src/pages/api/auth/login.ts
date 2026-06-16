import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { AuthAuditAction, logAuthAudit } from '../../../lib/audit-log';
import { createSupabaseApiClient } from '../../../lib/supabase/api';
import { ensurePrismaProfile } from '../../../lib/profile-sync';

const UNVERIFIED_MESSAGE =
  'You have not confirmed your email address yet. Please verify your email before logging in.';

function isEmailNotConfirmedError(message?: string) {
  if (!message) return false;
  const lower = message.toLowerCase();
  return lower.includes('email not confirmed') || lower.includes('not verified');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing' });

  const normalizedEmail = String(email).trim().toLowerCase();

  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) return res.status(500).json({ error: 'Auth not configured' });

  const prismaUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user || !data.session) {
    const unverifiedAccount =
      (prismaUser && !prismaUser.verified) || isEmailNotConfirmedError(error?.message);

    if (unverifiedAccount && prismaUser) {
      logAuthAudit({
        req,
        userId: prismaUser.id,
        email: prismaUser.email,
        action: AuthAuditAction.LOGIN_FAILURE,
      });
      return res.status(403).json({
        error: UNVERIFIED_MESSAGE,
        requiresVerification: true,
        userId: prismaUser.id,
        email: prismaUser.email,
      });
    }

    logAuthAudit({
      req,
      email: normalizedEmail,
      userId: prismaUser?.id ?? null,
      action: AuthAuditAction.LOGIN_FAILURE,
    });
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  let profile = prismaUser ?? (await prisma.user.findUnique({ where: { id: data.user.id } }));
  if (!profile) {
    profile = await ensurePrismaProfile(data.user);
  }

  const isVerified = profile.verified || !!data.user.email_confirmed_at;
  if (!isVerified) {
    await supabase.auth.signOut();
    logAuthAudit({
      req,
      userId: profile.id,
      email: profile.email,
      action: AuthAuditAction.LOGIN_FAILURE,
    });
    return res.status(403).json({
      error: UNVERIFIED_MESSAGE,
      requiresVerification: true,
      userId: profile.id,
      email: profile.email,
    });
  }

  if (profile.role === 'ADMIN') {
    await supabase.auth.signOut();
    logAuthAudit({
      req,
      userId: profile.id,
      email: profile.email,
      action: AuthAuditAction.LOGIN_FAILURE,
    });
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

  logAuthAudit({
    req,
    userId: profile.id,
    email: profile.email,
    action: AuthAuditAction.LOGIN_SUCCESS,
  });

  return res.status(200).json({ token: data.session.access_token });
}
