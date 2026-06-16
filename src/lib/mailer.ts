import { Resend } from 'resend';
import { getAppUrl } from './auth-utils';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@trustedmm.com';

let resend: Resend | null = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export async function sendVerificationEmail(to: string, link: string) {
  const subject = 'Verify your email';
  const html = `<p>Please verify your email by clicking <a href="${link}">this link</a>.</p><p>If you did not sign up, ignore this message.</p>`;

  if (resend) {
    try {
      await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
      return;
    } catch (e) {
      console.error('Resend failed', e);
    }
  }

  console.log(`Verification email for ${to}: ${link}`);
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const subject = 'Reset your TrustedMM password';
  const appUrl = getAppUrl();
  const html = `
    <p>You requested a password reset for your TrustedMM account.</p>
    <p><a href="${resetLink}">Reset your password</a></p>
    <p>If you did not request this, you can safely ignore this email.</p>
    <p>This link will take you to: ${appUrl}/reset-password</p>
  `;

  if (!resend) {
    console.error('[password-reset] RESEND_API_KEY is not configured — cannot send reset email', {
      to: maskEmail(to),
      resetLink,
    });
    throw new Error('Password reset email service is not configured');
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log('[password-reset] Reset email sent via Resend', {
      to: maskEmail(to),
      messageId: result.data?.id ?? null,
    });

    return result;
  } catch (error) {
    console.error('[password-reset] Resend failed to send reset email', {
      to: maskEmail(to),
      error,
    });
    throw error;
  }
}

export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  if (!text) text = html.replace(/<[^>]+>/g, '');

  if (resend) {
    try {
      await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
      return;
    } catch (e) {
      console.error('Resend send failed', e);
    }
  }

  console.log(`Email fallback for ${to} — subject: ${subject}\n${text}`);
}
