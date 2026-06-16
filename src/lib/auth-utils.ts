const PRODUCTION_APP_URL = 'https://trustedmm.com';

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || PRODUCTION_APP_URL;
}

export function getAuthCallbackUrl() {
  return `${getAppUrl()}/api/auth/callback`;
}

export function getResetPasswordUrl() {
  return `${getAppUrl()}/reset-password`;
}

export function clearLegacyTokenCookie(res: { setHeader: (name: string, value: string) => void }) {
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
}
