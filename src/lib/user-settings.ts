import { prisma } from './prisma';

export type ProfileVisibility = 'PUBLIC' | 'TRADES_ONLY' | 'PRIVATE';
export type ThemePreference = 'dark' | 'system';

export type UserSettingsData = {
  notifyTradeUpdates: boolean;
  notifyDisputeUpdates: boolean;
  notifyMessages: boolean;
  notifySecurityAlerts: boolean;
  notifyMarketing: boolean;
  profileVisibility: ProfileVisibility;
  theme: ThemePreference;
  compactUi: boolean;
};

export const DEFAULT_USER_SETTINGS: UserSettingsData = {
  notifyTradeUpdates: true,
  notifyDisputeUpdates: true,
  notifyMessages: true,
  notifySecurityAlerts: true,
  notifyMarketing: false,
  profileVisibility: 'TRADES_ONLY',
  theme: 'dark',
  compactUi: false,
};

export async function getOrCreateUserSettings(userId: string) {
  const existing = await prisma.userSettings.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.userSettings.create({
    data: { userId, ...DEFAULT_USER_SETTINGS },
  });
}

export function serializeUserSettings(settings: {
  notifyTradeUpdates: boolean;
  notifyDisputeUpdates: boolean;
  notifyMessages: boolean;
  notifySecurityAlerts: boolean;
  notifyMarketing: boolean;
  profileVisibility: string;
  theme: string;
  compactUi: boolean;
}): UserSettingsData {
  const visibility = settings.profileVisibility as ProfileVisibility;
  const theme = settings.theme as ThemePreference;

  return {
    notifyTradeUpdates: settings.notifyTradeUpdates,
    notifyDisputeUpdates: settings.notifyDisputeUpdates,
    notifyMessages: settings.notifyMessages,
    notifySecurityAlerts: settings.notifySecurityAlerts,
    notifyMarketing: settings.notifyMarketing,
    profileVisibility:
      visibility === 'PUBLIC' || visibility === 'PRIVATE' ? visibility : 'TRADES_ONLY',
    theme: theme === 'system' ? 'system' : 'dark',
    compactUi: settings.compactUi,
  };
}

export function parseSettingsPatch(body: Record<string, unknown>): Partial<UserSettingsData> {
  const patch: Partial<UserSettingsData> = {};

  const boolKeys = [
    'notifyTradeUpdates',
    'notifyDisputeUpdates',
    'notifyMessages',
    'notifySecurityAlerts',
    'notifyMarketing',
    'compactUi',
  ] as const;

  for (const key of boolKeys) {
    if (typeof body[key] === 'boolean') patch[key] = body[key];
  }

  if (body.profileVisibility === 'PUBLIC' || body.profileVisibility === 'TRADES_ONLY' || body.profileVisibility === 'PRIVATE') {
    patch.profileVisibility = body.profileVisibility;
  }

  if (body.theme === 'dark' || body.theme === 'system') {
    patch.theme = body.theme;
  }

  return patch;
}
