import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { AuthAuditAction, logAuthAudit } from '../../../lib/audit-log';
import { requireAuth } from '../_helpers/requireAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const ctx = await requireAuth(req, res);
  if (!ctx) return;

  const { password } = req.body ?? {};
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password is required to disable 2FA.' });
  }

  await prisma.user.update({
    where: { id: ctx.user.id },
    data: { twoFA: false, twoFASecret: null },
  });

  logAuthAudit({
    req,
    userId: ctx.user.id,
    email: ctx.user.email,
    action: AuthAuditAction.TWO_FA_DISABLED,
  });

  return res.status(200).json({ ok: true, message: 'Two-factor authentication has been disabled.' });
}
