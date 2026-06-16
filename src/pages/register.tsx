import { useState } from 'react';
import Router from 'next/router';
import AuthShell from '../components/layout/AuthShell';
import { Button, Input, Alert, Card, CardTitle, CardDescription } from '../components/ui';
import {
  getPasswordStrength,
  isValidEmailFormat,
  isValidUsername,
  type PasswordStrength,
} from '../lib/password-strength';
import { cn } from '../lib/cn';

const STRENGTH_COLORS: Record<PasswordStrength, string> = {
  weak: 'bg-red-500',
  fair: 'bg-amber-500',
  good: 'bg-primary',
  strong: 'bg-emerald-500',
};

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

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label, percent } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">Password strength</span>
        <span className={cn('font-medium', score === 'weak' && 'text-red-300', score === 'fair' && 'text-amber-300', score === 'good' && 'text-primary', score === 'strong' && 'text-emerald-300')}>
          {label}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', STRENGTH_COLORS[score])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateUsername = (value: string) => {
    if (!value) return 'Username is required';
    if (!isValidUsername(value)) return '3–24 characters, letters, numbers, and underscores only';
    return null;
  };

  const validateEmail = (value: string) => {
    if (!value) return 'Email is required';
    if (!isValidEmailFormat(value)) return 'Please enter a valid email address';
    return null;
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (value) setUsernameError(validateUsername(value));
    else setUsernameError(null);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value) setEmailError(validateEmail(value));
    else setEmailError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const uErr = validateUsername(username);
    const eErr = validateEmail(email);
    setUsernameError(uErr);
    setEmailError(eErr);

    if (!email || !password || !username) {
      setError('Email, username and password required');
      return;
    }
    if (uErr || eErr) return;

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password, username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell
        title="Check your email"
        subtitle="Your account has been created successfully."
        footer={
          <p className="text-sm text-center text-slate-400">
            Already verified?{' '}
            <a href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </a>
          </p>
        }
      >
        <Card padding="md" className="border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-emerald-100">Account created</CardTitle>
              <CardDescription className="text-emerald-200/70 mt-2">
                Please check your email and click the verification link to activate your account before signing in.
              </CardDescription>
              <Button
                className="mt-4"
                onClick={() => Router.push('/login')}
              >
                Go to sign in
              </Button>
            </div>
          </div>
        </Card>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create an account"
      subtitle="Join TrustedMM to start trading securely."
      footer={
        <p className="text-sm text-center text-slate-400">
          Already have an account?{' '}
          <a href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </a>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="Username"
          placeholder="your_username"
          value={username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          onBlur={() => setUsernameError(validateUsername(username))}
          error={usernameError ?? undefined}
          disabled={loading}
          autoComplete="username"
          hint="Unique username visible to other traders"
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          onBlur={() => setEmailError(validateEmail(email))}
          error={emailError ?? undefined}
          disabled={loading}
          autoComplete="email"
        />

        <div className="space-y-1.5">
          <label htmlFor="register-password" className="block text-sm font-medium text-slate-200">
            Password
          </label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              className="app-input pr-11"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrengthBar password={password} />
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
