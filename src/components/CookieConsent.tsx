import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setShowBanner(true);
  }, []);

  function acceptCookies() {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  }

  function rejectCookies() {
    localStorage.setItem('cookie-consent', 'rejected');
    setShowBanner(false);
  }

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-5">
      <div className="app-card mx-auto max-w-4xl border border-white/10 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h3 className="font-semibold text-white">Cookie Policy</h3>
            <p className="mt-1 text-sm text-slate-300 leading-relaxed">
              We use cookies to enhance your experience and analyze traffic. By clicking Accept, you
              consent to our use of cookies. Read our{' '}
              <a
                href="/privacy-policy"
                className="text-accent hover:text-accent-hover underline transition-colors duration-200"
              >
                Privacy Policy
              </a>{' '}
              for details.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={rejectCookies}
              className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-white hover:bg-white/5 transition-colors duration-200"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={acceptCookies}
              className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-hover transition-colors duration-200"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
