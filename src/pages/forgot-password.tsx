import { useState } from 'react';
import AuthShell from '../components/layout/AuthShell';
import { Button, Input, Alert, Card, CardTitle, CardDescription } from '../components/ui';
import { isValidEmail, mapAuthError } from '../lib/password-reset';

const SUCCESS_MESSAGE =
  'If an account exists for that email, a reset link has been sent.';

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}

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
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email and we'll send you a link to reset your password."
      footer={
        <p className="text-sm text-center text-slate-400">
          <a href="/login" className="text-primary font-medium hover:underline">
            Back to sign in
          </a>
        </p>
      }
    >
      <div className="flex justify-center mb-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
          <LockIcon className="h-7 w-7" />
        </div>
      </div>

      {success ? (
        <Card padding="md" className="border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <MailIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-emerald-100">Check your inbox</CardTitle>
              <CardDescription className="text-emerald-200/70 mt-2">
                {SUCCESS_MESSAGE} The link will expire after a short time for your security.
              </CardDescription>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
              >
                Send another link
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sending}
            autoComplete="email"
          />

          {error && <Alert variant="error">{error}</Alert>}

          <Button type="submit" className="w-full" size="lg" loading={sending}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
