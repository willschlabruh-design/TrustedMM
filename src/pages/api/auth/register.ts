import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { getAuthCallbackUrl } from '../../../lib/auth-utils';
import { AuthAuditAction, logAuthAudit } from '../../../lib/audit-log';
import { createPrismaProfile } from '../../../lib/profile-sync';
import { createSupabaseApiClient } from '../../../lib/supabase/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).end();
    }

    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({
        error: 'Missing email, password or username',
      });
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return res.status(409).json({
        error: 'Email already registered',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Username already taken',
      });
    }

    const supabase = createSupabaseApiClient(req, res);

    if (!supabase) {
      return res.status(500).json({
        error: 'Auth not configured',
      });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthCallbackUrl(),
        data: { username },
      },
    });

    if (error) {
      return res.status(400).json({
        error: error.message,
        source: 'supabase-signup',
      });
    }

    if (!data.user) {
      return res.status(500).json({
        error: 'Failed to create account',
        source: 'supabase-user',
      });
    }

    const user = await createPrismaProfile({
      id: data.user.id,
      email,
      username,
      verified: !!data.user.email_confirmed_at,
    });

    logAuthAudit({
      req,
      userId: user.id,
      email: user.email,
      action: AuthAuditAction.USER_REGISTRATION,
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } catch (error: any) {
    console.error('REGISTER ERROR:', error);

    return res.status(500).json({
      error: error?.message || 'Unknown error',
      code: error?.code || null,
      stack: process.env.NODE_ENV === 'development'
        ? error?.stack
        : undefined,
    });
  }
}