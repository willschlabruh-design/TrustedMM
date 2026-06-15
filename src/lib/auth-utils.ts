export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export function getAuthCallbackUrl() {
  return `${getAppUrl()}/auth/callback`;
}

export function getResetPasswordUrl() {
  return `${getAppUrl()}/reset-password`;
}

export function clearLegacyTokenCookie(res: { setHeader: (name: string, value: string) => void }) {
  res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
}
