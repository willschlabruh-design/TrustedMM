import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PageShell from '../../components/layout/PageShell';
import { Alert, Card } from '../../components/ui';
import { createBrowserClient } from '../../lib/supabase/browser';

type CallbackState = 'loading' | 'error';

export default function AuthCallback() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>('loading');
  const [error, setError] = useState<string | null>(null);

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
        } else {
          const { error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('No active session found');
        }

        await fetch('/api/auth/sync-profile', {
          method: 'POST',
          credentials: 'same-origin',
        });

        if (!mounted) return;
        await router.replace('/');
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Authentication callback failed');
        setState('error');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router, router.isReady, router.query.code]);

  if (state === 'error' && error) {
    return (
      <PageShell showFooter={false} maxWidth="md" className="flex items-center justify-center min-h-[60vh]">
        <Card padding="lg" className="w-full max-w-md animate-slide-up">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-red-300">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sign in failed</h1>
              <p className="mt-2 text-sm text-slate-400">
                We couldn&apos;t complete your authentication. Please try again.
              </p>
            </div>
            <Alert variant="error">{error}</Alert>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold bg-primary/90 text-white hover:bg-primary transition-colors"
            >
              Return to sign in
            </a>
          </div>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell showFooter={false} maxWidth="md" className="flex items-center justify-center min-h-[60vh]">
      <Card padding="lg" className="w-full max-w-md animate-slide-up">
        <div className="flex flex-col items-center text-center space-y-4 py-4">
          <span
            className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-hidden
          />
          <div>
            <h1 className="text-xl font-bold text-white">Completing sign in</h1>
            <p className="mt-2 text-sm text-slate-400">
              Please wait while we verify your credentials and set up your session.
            </p>
          </div>
        </div>
      </Card>
    </PageShell>
  );
}
