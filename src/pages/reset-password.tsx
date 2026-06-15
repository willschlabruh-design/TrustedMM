import { useEffect, useState } from 'react';
import Router from 'next/router';
import { useRouter } from 'next/router';
import { createBrowserClient } from '../lib/supabase/browser';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    let mounted = true;

    (async () => {
      try {
        const supabase = createBrowserClient();
        const code = router.query.code;

        if (typeof code === 'string') {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!mounted) return;

        if (session) {
          setReady(true);
          return;
        }

        setError('Invalid or expired reset link. Please request a new password reset.');
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Failed to load password reset session');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router, router.isReady, router.query.code]);

  const submit = async (e: any) => {
    e.preventDefault();
    setError(null);
    if (!ready) return setError('Reset session not ready. Please use the link from your email.');

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Failed');
    Router.push('/login');
  };

  return (
    <div className="min-h-screen pt-36">
      <div className="container mx-auto px-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Reset password</h1>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            className="w-full p-3 rounded bg-white/6"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!ready}
          />
          {error && <div className="text-red-400">{error}</div>}
          <button className="bg-accent px-4 py-2 rounded" disabled={!ready}>
            Reset
          </button>
        </form>
      </div>
    </div>
  );
}
