import DashboardPreview from './DashboardPreview';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

const TRUST_INDICATORS = [
  'Protected by Escrow',
  'Identity Verification Required',
  'Verified Middlemen',
  'Professional Dispute Resolution',
] as const;

export default function Hero() {
  const router = useRouter();

  const handleStartTrade = useCallback(async (e: React.SyntheticEvent) => {
    e?.preventDefault?.();
    try {
      const r = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (r.ok) {
        const j = await r.json();
        if (j?.user) {
          router.push('/create-trade');
          return;
        }
      }
    } catch {
      // fall through to login
    }
    router.push('/login?next=/create-trade');
  }, [router]);

  return (
    <section className="hero-section relative overflow-hidden bg-animated-gradient">
      <div className="container mx-auto px-6 relative z-20">
        <div className="hero-section-inner">
          <div className="max-w-2xl">
            <img
              src="/api/assets/logo"
              alt="Trusted logo"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg mb-5"
            />
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-[1.08] tracking-tight">
              Trade Safely. Every Time.
            </h1>
            <p className="mt-5 text-slate-200 text-base sm:text-lg leading-relaxed max-w-xl">
              TrustedMM acts as a secure middleman for digital asset transactions, protecting both
              buyers and sellers until the deal is complete.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={handleStartTrade}
                className="bg-accent px-5 py-3 rounded-md font-semibold text-black hover:scale-105 transition"
              >
                Start Trade
              </button>
              <a
                href="#how"
                className="px-5 py-3 rounded-md border border-white/10 hover:bg-white/6 transition"
              >
                Learn More
              </a>
            </div>

            <div className="mt-8 hero-trust-grid" aria-label="Platform protections">
              {TRUST_INDICATORS.map((label) => (
                <div key={label} className="hero-trust-item">
                  <span className="hero-trust-check" aria-hidden>
                    ✓
                  </span>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-dashboard-wrap">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
