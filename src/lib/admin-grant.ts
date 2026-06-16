export const ADMIN_USERNAMES = ['willschla'] as const;
export const ADMIN_EMAILS = ['william.schlanbusch@gmail.com'] as const;

export function isAdminEligible(email: string, username: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim().toLowerCase();
  return (
    ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === normalizedEmail) ||
    ADMIN_USERNAMES.some((adminUsername) => adminUsername.toLowerCase() === normalizedUsername)
  );
}

export function resolveAdminRole(email: string, username: string, currentRole = 'USER') {
  if (currentRole === 'BANNED' || currentRole === 'DELETED') {
    return currentRole;
  }
  return isAdminEligible(email, username) ? 'ADMIN' : currentRole;
}
