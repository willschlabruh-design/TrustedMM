import { useEffect, useState } from 'react';
import Router from 'next/router';
import AuthShell from '../components/layout/AuthShell';
import { Button, Input, Alert } from '../components/ui';

const RESEND_COOLDOWN_SECONDS = 10;
const UNVERIFIED_MESSAGE =
  'You have not confirmed your email address yet. Please verify your email before logging in.';

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
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

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
      setLoading(false);
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
      setLoading(false);
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
  const formLocked = requiresVerification || requiresEmailVerification;

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Enter your credentials to access your account."
      footer={
        <p className="text-sm text-center text-slate-400">
          Don&apos;t have an account?{' '}
          <a href="/register" className="text-primary font-medium hover:underline">
            Create one
          </a>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={formLocked || loading}
          autoComplete="email"
        />

        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={setPassword}
          disabled={formLocked || loading}
          autoComplete="current-password"
        />

        {!formLocked && (
          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
              />
              Remember me
            </label>
            <a
              href="/forgot-password"
              className="text-sm text-primary hover:underline shrink-0"
            >
              Forgot password?
            </a>
          </div>
        )}

        {error && (
          <Alert
            variant={formLocked ? 'warning' : 'error'}
            title={formLocked ? 'Verification required' : undefined}
          >
            {error}
          </Alert>
        )}

        {requiresVerification && (
          <div className="space-y-3">
            {resendSuccess && (
              <Alert variant="success">
                A new verification email has been sent.
              </Alert>
            )}
            {resendError && (
              <Alert variant="error">{resendError}</Alert>
            )}
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={resendVerification}
              disabled={resendDisabled}
              loading={sending}
            >
              {resendCooldown > 0
                ? `Resend available in ${resendCooldown}s`
                : 'Resend verification email'}
            </Button>
          </div>
        )}

        {requiresEmailVerification && isAdmin && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">
              Admin accounts require email verification. Check your inbox for a verification link to complete login.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={resendAdminVerification}
              disabled={sending}
              loading={sending}
            >
              Resend admin verification email
            </Button>
          </div>
        )}

        {!formLocked && (
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign in
          </Button>
        )}
      </form>
    </AuthShell>
  );
}
