export function getClientAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://trustedmm.com';
}

export function getClientResetPasswordUrl() {
  return `${getClientAppUrl()}/reset-password`;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function mapAuthError(message?: string, context: 'forgot' | 'reset' = 'forgot'): string {
  if (!message) {
    return context === 'reset'
      ? 'Unable to reset your password. Please try again.'
      : 'Unable to send reset email. Please try again.';
  }

  const lower = message.toLowerCase();

  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (context === 'reset') {
    if (lower.includes('expired') || lower.includes('invalid') || lower.includes('session')) {
      return 'This reset link has expired. Please request a new password reset.';
    }
    if (lower.includes('weak') || lower.includes('short') || lower.includes('least')) {
      return 'Password is too weak. Use at least 8 characters.';
    }
    if (lower.includes('same')) {
      return 'Choose a different password than your current one.';
    }
  }

  if (context === 'forgot' && lower.includes('invalid') && lower.includes('email')) {
    return 'Please enter a valid email address.';
  }

  return context === 'reset'
    ? 'Unable to reset your password. Please try again.'
    : 'Unable to send reset email. Please try again.';
}
