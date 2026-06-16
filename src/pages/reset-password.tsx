import { useEffect, useState } from 'react';
import Router from 'next/router';
import { useRouter } from 'next/router';
import AuthShell from '../components/layout/AuthShell';
import { Button, Alert, Card, CardTitle, CardDescription } from '../components/ui';
import { createBrowserClient } from '../lib/supabase/browser';
import { mapAuthError } from '../lib/password-reset';

const MIN_PASSWORD_LENGTH = 8;

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <path d="M1 1l22 22" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4L12 14.01l-3-3" />
    </svg>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  disabled,
  id,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-200">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className="app-input pr-11"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoComplete={autoComplete}
          minLength={MIN_PASSWORD_LENGTH}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    let mounted = true;
    const supabase = createBrowserClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
        setError(null);
      }
    });

    (async () => {
      try {
        const code = router.query.code;

        if (typeof code === 'string') {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            if (!mounted) return;
            setError(mapAuthError(exchangeError.message, 'reset'));
            return;
          }
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          if (!mounted) return;
          setError(mapAuthError(sessionError.message, 'reset'));
          return;
        }

        if (!mounted) return;

        if (session) {
          setReady(true);
          return;
        }

        setError('This reset link has expired. Please request a new password reset.');
      } catch (err) {
        if (!mounted) return;
        console.error('Reset password session error:', err);
        setError(mapAuthError(undefined, 'reset'));
      }
    })();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, router.isReady, router.query.code]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ready) {
      setError('This reset link has expired. Please request a new password reset.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || mapAuthError(undefined, 'reset'));
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        Router.push('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(mapAuthError(undefined, 'reset'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle={success ? 'Your password has been updated.' : 'Choose a new password for your account.'}
      footer={
        !success && (
          <p className="text-sm text-center text-slate-400">
            <a href="/forgot-password" className="text-primary hover:underline">
              Request a new reset link
            </a>
            {' · '}
            <a href="/login" className="text-primary hover:underline">
              Back to sign in
            </a>
          </p>
        )
      }
    >
      {success ? (
        <Card padding="md" className="border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-emerald-100">Password updated</CardTitle>
              <CardDescription className="text-emerald-200/70 mt-2">
                Your password has been changed successfully. Redirecting you to sign in…
              </CardDescription>
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"
                  aria-hidden
                />
                Redirecting…
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {!ready && !error && (
            <div className="flex items-center justify-center gap-3 py-6 text-slate-400">
              <span
                className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"
                aria-hidden
              />
              <span className="text-sm">Verifying reset link…</span>
            </div>
          )}

          {(ready || error) && (
            <>
              <PasswordField
                id="reset-password"
                label="New password"
                value={password}
                onChange={setPassword}
                disabled={!ready || submitting}
                autoComplete="new-password"
              />

              <PasswordField
                id="reset-confirm-password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                disabled={!ready || submitting}
                autoComplete="new-password"
              />

              <p className="text-xs text-slate-400">
                Must be at least {MIN_PASSWORD_LENGTH} characters.
              </p>

              {error && <Alert variant="error">{error}</Alert>}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!ready || submitting}
                loading={submitting}
              >
                Update password
              </Button>
            </>
          )}
        </form>
      )}
    </AuthShell>
  );
}
