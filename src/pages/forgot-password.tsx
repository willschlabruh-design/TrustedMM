import { useState } from 'react';
import Header from '../components/Header';
import { isValidEmail, mapAuthError } from '../lib/password-reset';

const SUCCESS_MESSAGE =
  'If an account exists for that email, a reset link has been sent.';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }

    if (!isValidEmail(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSending(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email: trimmed }),
      });

      let data: { error?: string; message?: string } = {};
      try {
        data = await res.json();
      } catch {
        setError('Server error — please try again.');
        return;
      }

      if (!res.ok) {
        setError(data.error || mapAuthError(undefined, 'forgot'));
        console.error('[password-reset] API error response', {
          status: res.status,
          error: data.error,
          detail: (data as { detail?: string }).detail,
        });
        return;
      }

      setSuccess(true);
      console.log('[password-reset] API success', { message: data.message });
    } catch (err) {
      console.error('Forgot password network error:', err);
      setError(mapAuthError(undefined, 'forgot'));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-36">
        <div className="container mx-auto px-6 max-w-md">
          <div className="form-dark">
            <h1 className="text-2xl font-bold mb-4">Forgot password</h1>
            <p className="text-sm text-slate-300 mb-4">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {success ? (
              <div className="p-3 rounded bg-green-900/30 text-green-200 border border-green-600">
                {SUCCESS_MESSAGE}
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <input
                  className="w-full p-3 rounded"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={sending}
                  autoComplete="email"
                />
                {error && (
                  <div className="p-3 rounded bg-red-900/30 text-red-200 border border-red-600">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded w-full"
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <p className="mt-4 text-sm text-slate-400">
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
