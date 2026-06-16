export function getClientAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://trustedmm.com';
}

export function getClientResetPasswordUrl() {
  return `${getClientAppUrl()}/reset-password`;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const GENERIC_FORGOT_FAILURE = 'Unable to send reset email. Please try again.';

export function mapAuthError(message?: string, context: 'forgot' | 'reset' = 'forgot'): string {
  if (!message) {
    return context === 'reset'
      ? 'Unable to reset your password. Please try again.'
      : GENERIC_FORGOT_FAILURE;
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

  if (
    lower.includes('rate') ||
    lower.includes('too many') ||
    lower.includes('over_email_send_rate_limit')
  ) {
    return 'Too many reset requests. Please wait a few minutes and try again.';
  }

  if (lower.includes('redirect') || lower.includes('localhost')) {
    return 'Password reset is misconfigured. Please contact support.';
  }

  if (lower.includes('not configured') || lower.includes('api key')) {
    return 'Password reset email service is not configured. Please contact support.';
  }

  if (context === 'forgot' && lower.includes('user not found')) {
    // Supabase admin generateLink returns this; still avoid leaking account existence in UI.
    return GENERIC_FORGOT_FAILURE;
  }

  return context === 'reset'
    ? 'Unable to reset your password. Please try again.'
    : GENERIC_FORGOT_FAILURE;
}
