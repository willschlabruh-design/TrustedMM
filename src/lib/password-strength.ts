export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

export function getPasswordStrength(password: string): {
  score: PasswordStrength;
  label: string;
  percent: number;
} {
  if (!password) return { score: 'weak', label: 'Enter a password', percent: 0 };

  let points = 0;
  if (password.length >= 8) points += 1;
  if (password.length >= 12) points += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points += 1;
  if (/\d/.test(password)) points += 1;
  if (/[^A-Za-z0-9]/.test(password)) points += 1;

  if (points <= 1) return { score: 'weak', label: 'Weak', percent: 25 };
  if (points === 2) return { score: 'fair', label: 'Fair', percent: 50 };
  if (points === 3 || points === 4) return { score: 'good', label: 'Good', percent: 75 };
  return { score: 'strong', label: 'Strong', percent: 100 };
}

export function isValidUsername(username: string) {
  return /^[a-zA-Z0-9_]{3,24}$/.test(username);
}

export function isValidEmailFormat(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
