import { useEffect, useState } from 'react';
import Router from 'next/router';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import { createBrowserClient } from '../lib/supabase/browser';
import { mapAuthError } from '../lib/password-reset';

const MIN_PASSWORD_LENGTH = 8;

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
    <>
      <Header />
      <div className="min-h-screen pt-36">
        <div className="container mx-auto px-6 max-w-md">
          <div className="form-dark">
            <h1 className="text-2xl font-bold mb-4">Reset password</h1>

            {success ? (
              <div className="p-3 rounded bg-green-900/30 text-green-200 border border-green-600">
                Password updated successfully. Redirecting to sign in...
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input
                  type="password"
                  className="w-full p-3 rounded"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={!ready || submitting}
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                />
                <input
                  type="password"
                  className="w-full p-3 rounded"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={!ready || submitting}
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD_LENGTH}
                />
                <p className="text-xs text-slate-400">
                  Must be at least {MIN_PASSWORD_LENGTH} characters.
                </p>
                {error && (
                  <div className="p-3 rounded bg-red-900/30 text-red-200 border border-red-600">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded w-full"
                  disabled={!ready || submitting}
                >
                  {submitting ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            )}

            <p className="mt-4 text-sm text-slate-400">
              <a href="/forgot-password" className="underline hover:text-white">
                Request a new reset link
              </a>
              {' · '}
              <a href="/login" className="underline hover:text-white">
                Back to sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
