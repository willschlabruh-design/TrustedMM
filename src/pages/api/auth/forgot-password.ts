import type { NextApiRequest, NextApiResponse } from 'next';
import { getAppUrl, getResetPasswordUrl } from '../../../lib/auth-utils';
import { isValidEmail, mapAuthError } from '../../../lib/password-reset';
import { sendPasswordResetEmail } from '../../../lib/mailer';
import { createSupabaseAdminClient } from '../../../lib/supabase/admin';
import { createSupabaseApiClient } from '../../../lib/supabase/api';

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}

const GENERIC_SUCCESS =
  'If an account exists for that email, a reset link has been sent.';

type DeliveryResult =
  | { ok: true; method: 'supabase' | 'resend' }
  | { ok: false; method: 'supabase' | 'resend'; reason: string; status?: number };

function getRedirectMisconfiguration(redirectTo: string): string | null {
  const appUrl = getAppUrl();
  const isProductionApp = appUrl.includes('trustedmm.com');

  if (isProductionApp && redirectTo.includes('localhost')) {
    return `redirectTo contains localhost while app URL is ${appUrl}`;
  }

  if (isProductionApp && !redirectTo.startsWith('https://trustedmm.com')) {
    return `redirectTo must use https://trustedmm.com in production (got ${redirectTo})`;
  }

  return null;
}

async function deliverViaSupabase(
  req: NextApiRequest,
  res: NextApiResponse,
  email: string,
  redirectTo: string
): Promise<DeliveryResult> {
  const supabase = createSupabaseApiClient(req, res);
  if (!supabase) {
    console.error('[password-reset] Supabase public client unavailable');
    return { ok: false, method: 'supabase', reason: 'Auth client unavailable' };
  }

  console.log('[password-reset] Calling resetPasswordForEmail', {
    email: maskEmail(email),
    redirectTo,
  });

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    console.error('[password-reset] resetPasswordForEmail returned error', {
      email: maskEmail(email),
      message: error.message,
      status: error.status,
      name: error.name,
    });
    return {
      ok: false,
      method: 'supabase',
      reason: error.message,
      status: error.status,
    };
  }

  console.log('[password-reset] resetPasswordForEmail accepted by Supabase', {
    email: maskEmail(email),
    redirectTo,
    data,
  });

  return { ok: true, method: 'supabase' };
}

async function deliverViaResend(
  email: string,
  redirectTo: string
): Promise<DeliveryResult> {
  const supabaseAdmin = createSupabaseAdminClient();
  if (!supabaseAdmin) {
    console.warn('[password-reset] Skipping Resend path — SUPABASE_SERVICE_ROLE_KEY missing');
    return { ok: false, method: 'resend', reason: 'Service role key not configured' };
  }

  if (!process.env.RESEND_API_KEY?.trim()) {
    console.warn('[password-reset] Skipping Resend path — RESEND_API_KEY missing');
    return { ok: false, method: 'resend', reason: 'Resend API key not configured' };
  }

  console.log('[password-reset] Calling admin.generateLink (recovery)', {
    email: maskEmail(email),
    redirectTo,
  });

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo },
  });

  if (error) {
    console.error('[password-reset] generateLink returned error', {
      email: maskEmail(email),
      message: error.message,
      status: error.status,
      name: error.name,
    });
    return {
      ok: false,
      method: 'resend',
      reason: error.message,
      status: error.status,
    };
  }

  const resetLink = data?.properties?.action_link;
  if (!resetLink) {
    console.error('[password-reset] generateLink succeeded but action_link is missing', {
      email: maskEmail(email),
      properties: data?.properties ?? null,
    });
    return { ok: false, method: 'resend', reason: 'Reset link generation returned no link' };
  }

  if (getAppUrl().includes('trustedmm.com') && resetLink.includes('localhost')) {
    console.error('[password-reset] Generated action_link contains localhost', {
      email: maskEmail(email),
      resetLinkPreview: resetLink.slice(0, 120),
    });
    return {
      ok: false,
      method: 'resend',
      reason:
        'Supabase generated a localhost reset link. Set Site URL to https://trustedmm.com in the Supabase dashboard.',
    };
  }

  try {
    await sendPasswordResetEmail(email, resetLink);
    console.log('[password-reset] Reset email sent via Resend', {
      email: maskEmail(email),
      redirectTo,
    });
    return { ok: true, method: 'resend' };
  } catch (mailError) {
    const message =
      mailError instanceof Error ? mailError.message : 'Resend delivery failed';
    console.error('[password-reset] Resend send failed', {
      email: maskEmail(email),
      message,
      mailError,
    });
    return { ok: false, method: 'resend', reason: message };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const redirectTo = getResetPasswordUrl();
  const appUrl = getAppUrl();

  const redirectMisconfiguration = getRedirectMisconfiguration(redirectTo);
  if (redirectMisconfiguration) {
    console.error('[password-reset] Redirect misconfiguration', {
      redirectMisconfiguration,
      redirectTo,
      appUrl,
    });
    return res.status(500).json({
      error: 'Password reset is misconfigured. Please contact support.',
    });
  }

  console.log('[password-reset] Request received', {
    email: maskEmail(trimmedEmail),
    redirectTo,
    appUrl,
    hasResendKey: !!process.env.RESEND_API_KEY?.trim(),
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
    fromEmail: process.env.FROM_EMAIL ?? '(default no-reply@trustedmm.com)',
  });

  try {
    // Primary: Supabase Auth email (same delivery path as signup verification).
    const supabaseResult = await deliverViaSupabase(req, res, trimmedEmail, redirectTo);
    if (supabaseResult.ok) {
      return res.status(200).json({ ok: true, message: GENERIC_SUCCESS });
    }

    console.warn('[password-reset] Supabase delivery failed, trying Resend fallback', {
      email: maskEmail(trimmedEmail),
      reason: supabaseResult.reason,
    });

    // Fallback: custom branded email via generateLink + Resend when configured.
    const resendResult = await deliverViaResend(trimmedEmail, redirectTo);
    if (resendResult.ok) {
      return res.status(200).json({ ok: true, message: GENERIC_SUCCESS });
    }

    const failureReason = supabaseResult.reason || resendResult.reason;
    console.error('[password-reset] All delivery paths failed', {
      email: maskEmail(trimmedEmail),
      supabaseReason: supabaseResult.reason,
      resendReason: resendResult.reason,
    });

    const status =
      supabaseResult.status && supabaseResult.status >= 400
        ? supabaseResult.status
        : 502;

    return res.status(status).json({
      error: mapAuthError(failureReason, 'forgot'),
      detail:
        process.env.NODE_ENV === 'development' ? failureReason : undefined,
    });
  } catch (error) {
    console.error('[password-reset] Unexpected handler error', {
      email: maskEmail(trimmedEmail),
      error,
    });
    return res.status(500).json({
      error: mapAuthError(undefined, 'forgot'),
    });
  }
}
