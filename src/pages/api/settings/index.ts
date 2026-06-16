import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { AuthAuditAction, logAuthAudit } from '../../../lib/audit-log';
import {
  getOrCreateUserSettings,
  parseSettingsPatch,
  serializeUserSettings,
} from '../../../lib/user-settings';
import { isValidUsername } from '../../../lib/password-strength';
import { requireAuth } from '../_helpers/requireAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const ctx = await requireAuth(req, res);
  if (!ctx) return;

  if (req.method === 'GET') {
    const [user, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          verified: true,
          role: true,
          twoFA: true,
          createdAt: true,
        },
      }),
      getOrCreateUserSettings(ctx.user.id),
    ]);

    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.status(200).json({
      user: { ...user, twoFAEnabled: user.twoFA },
      settings: serializeUserSettings(settings),
    });
  }

  if (req.method === 'PATCH') {
    const { username, name, ...settingsBody } = req.body ?? {};
    const updates: string[] = [];

    if (username !== undefined) {
      if (typeof username !== 'string' || !isValidUsername(username)) {
        return res.status(400).json({
          error: 'Username must be 3–24 characters and contain only letters, numbers, and underscores.',
        });
      }

      const taken = await prisma.user.findFirst({
        where: { username, NOT: { id: ctx.user.id } },
      });
      if (taken) return res.status(409).json({ error: 'Username is already taken.' });

      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { username },
      });
      updates.push('username');
      logAuthAudit({
        req,
        userId: ctx.user.id,
        email: ctx.user.email,
        action: AuthAuditAction.USERNAME_CHANGED,
      });
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length > 64) {
        return res.status(400).json({ error: 'Display name must be 64 characters or fewer.' });
      }
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { name: name.trim() || null },
      });
      updates.push('name');
    }

    const settingsPatch = parseSettingsPatch(settingsBody);
    if (Object.keys(settingsPatch).length > 0) {
      await getOrCreateUserSettings(ctx.user.id);
      await prisma.userSettings.update({
        where: { userId: ctx.user.id },
        data: settingsPatch,
      });
      updates.push('settings');
      logAuthAudit({
        req,
        userId: ctx.user.id,
        email: ctx.user.email,
        action: AuthAuditAction.SETTINGS_UPDATED,
      });
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update.' });
    }

    const [user, settings] = await Promise.all([
      prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          verified: true,
          role: true,
          twoFA: true,
          createdAt: true,
        },
      }),
      getOrCreateUserSettings(ctx.user.id),
    ]);

    return res.status(200).json({
      ok: true,
      user: user ? { ...user, twoFAEnabled: user.twoFA } : null,
      settings: serializeUserSettings(settings),
    });
  }

  return res.status(405).end();
}
