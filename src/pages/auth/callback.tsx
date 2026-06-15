import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createBrowserClient } from '../../lib/supabase/browser';

export default function AuthCallback() {
  const router = useRouter();
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
        await router.replace('/dashboard');
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || 'Authentication callback failed');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router, router.isReady, router.query.code]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <p>Completing sign in...</p>
    </div>
  );
}
