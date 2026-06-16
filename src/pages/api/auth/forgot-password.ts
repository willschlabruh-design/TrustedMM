import type { NextApiRequest, NextApiResponse } from 'next';
import { getResetPasswordUrl } from '../../../lib/auth-utils';
import { isValidEmail } from '../../../lib/password-reset';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const redirectTo = getResetPasswordUrl();

  console.log('[password-reset] Request received', {
    email: maskEmail(trimmedEmail),
    redirectTo,
  });

  try {
    const supabaseAdmin = createSupabaseAdminClient();

    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: trimmedEmail,
        options: { redirectTo },
      });

      if (error) {
        console.error('[password-reset] generateLink failed', {
          email: maskEmail(trimmedEmail),
          message: error.message,
          status: error.status,
        });
      } else {
        const resetLink =
          data.properties?.action_link ||
          (data as { action_link?: string }).action_link;

        if (resetLink) {
          try {
            await sendPasswordResetEmail(trimmedEmail, resetLink);
            console.log('[password-reset] Delivery succeeded via Resend + generateLink', {
              email: maskEmail(trimmedEmail),
            });
            return res.status(200).json({ ok: true, message: GENERIC_SUCCESS });
          } catch (mailError) {
            console.error('[password-reset] Resend delivery failed after generateLink', {
              email: maskEmail(trimmedEmail),
              mailError,
            });
          }
        } else {
          console.error('[password-reset] generateLink returned no action_link', {
            email: maskEmail(trimmedEmail),
            data,
          });
        }
      }
    } else {
      console.error('[password-reset] SUPABASE_SERVICE_ROLE_KEY missing — falling back to anon client');
    }

    const supabase = createSupabaseApiClient(req, res);
    if (!supabase) {
      console.error('[password-reset] Supabase public client unavailable');
      return res.status(500).json({ error: 'Password reset is temporarily unavailable.' });
    }

    const { error: fallbackError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo,
    });

    if (fallbackError) {
      console.error('[password-reset] Supabase resetPasswordForEmail fallback failed', {
        email: maskEmail(trimmedEmail),
        message: fallbackError.message,
        status: fallbackError.status,
      });
    } else {
      console.log('[password-reset] Fallback resetPasswordForEmail invoked', {
        email: maskEmail(trimmedEmail),
        redirectTo,
      });
    }
  } catch (error) {
    console.error('[password-reset] Unexpected handler error', {
      email: maskEmail(trimmedEmail),
      error,
    });
  }

  return res.status(200).json({ ok: true, message: GENERIC_SUCCESS });
}
