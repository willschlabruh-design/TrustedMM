import { useEffect, useState } from 'react';
import Router from 'next/router';
import Header from '../components/Header';

const RESEND_COOLDOWN_SECONDS = 10;
const UNVERIFIED_MESSAGE =
  'You have not confirmed your email address yet. Please verify your email before logging in.';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [requiresEmailVerification, setRequiresEmailVerification] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [sending, setSending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (!requiresVerification || resendCooldown <= 0) return;
    const timer = window.setTimeout(() => {
      setResendCooldown((current) => current - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [requiresVerification, resendCooldown]);

  const startResendCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResendSuccess(false);
    setResendError(null);
    setRequiresVerification(false);
    setRequiresEmailVerification(false);

    let res;
    let data: any = {};
    try {
      res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password }),
      });
      data = await res.json();
    } catch (err) {
      console.error('Network error during login', err);
      setError('Network error — please try again');
      return;
    }

    if (!res.ok) {
      if (res.status === 403 && data.requiresVerification) {
        setRequiresVerification(true);
        setUserId(data.userId ?? null);
        setVerificationEmail(data.email || email);
        setError(UNVERIFIED_MESSAGE);
        startResendCooldown();
      } else if (res.status === 403 && data.requiresEmailVerification) {
        setRequiresEmailVerification(true);
        setUserId(data.userId);
        setIsAdmin(data.isAdmin || false);
        setError(data.error);
        await sendAdminVerification(data.userId);
      } else {
        setError(data.error || 'Login failed');
      }
      return;
    }

    Router.push('/dashboard');
  };

  const sendAdminVerification = async (adminUserId: string) => {
    setSending(true);
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: adminUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError('Error: ' + (data.error || 'Failed to send verification email'));
      }
    } catch {
      setError('Network error');
    } finally {
      setSending(false);
    }
  };

  const resendVerification = async () => {
    if (!userId || resendCooldown > 0 || sending) return;

    setSending(true);
    setResendSuccess(false);
    setResendError(null);

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ userId, email: verificationEmail || email }),
      });
      const data = await res.json();

      if (res.ok) {
        setResendSuccess(true);
        startResendCooldown();
      } else {
        setResendError(data.error || 'Failed to resend verification email. Please try again.');
      }
    } catch {
      setResendError('Network error — please try again.');
    } finally {
      setSending(false);
    }
  };

  const resendAdminVerification = async () => {
    if (!userId) return;
    await sendAdminVerification(userId);
  };

  const resendDisabled = sending || resendCooldown > 0;

  return (
    <>
      <Header />
      <div className="min-h-screen pt-36">
        <div className="container mx-auto px-6 max-w-md">
          <div className="form-dark">
            <h1 className="text-2xl font-bold mb-4">Sign in</h1>
            <form onSubmit={submit} className="space-y-3">
              <input
                className="w-full p-3 rounded"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={requiresVerification || requiresEmailVerification}
              />
              <input
                type="password"
                className="w-full p-3 rounded"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={requiresVerification || requiresEmailVerification}
              />

              {error && (
                <div
                  className={`p-3 rounded ${
                    requiresVerification || requiresEmailVerification
                      ? 'bg-yellow-900/30 text-yellow-200 border border-yellow-600'
                      : 'bg-red-900/30 text-red-200 border border-red-600'
                  }`}
                >
                  {error}
                </div>
              )}

              {requiresVerification && (
                <div className="space-y-3">
                  {resendSuccess && (
                    <div className="p-3 rounded bg-green-900/30 text-green-200 border border-green-600">
                      A new verification email has been sent.
                    </div>
                  )}
                  {resendError && (
                    <div className="p-3 rounded bg-red-900/30 text-red-200 border border-red-600">
                      {resendError}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={resendVerification}
                    disabled={resendDisabled}
                    className="w-full px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending
                      ? 'Sending...'
                      : resendCooldown > 0
                        ? `Resend available in ${resendCooldown}s`
                        : 'Resend Verification Email'}
                  </button>
                </div>
              )}

              {requiresEmailVerification && isAdmin && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-300">
                    Admin accounts require email verification. Check your inbox for a verification link to complete login.
                  </p>
                  <button
                    type="button"
                    onClick={resendAdminVerification}
                    disabled={sending}
                    className="w-full px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Resend Admin Verification Email'}
                  </button>
                </div>
              )}

              {!requiresVerification && !requiresEmailVerification && (
                <>
                  <button type="submit" className="btn-primary px-4 py-2 rounded w-full">
                    Sign in
                  </button>
                  <p className="text-sm text-center text-slate-400">
                    <a href="/forgot-password" className="underline hover:text-white">
                      Forgot your password?
                    </a>
                  </p>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
