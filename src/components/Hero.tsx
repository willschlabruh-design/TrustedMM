import DashboardPreview from './DashboardPreview';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { BadgeCheck, Lock, Scale, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import BrandLogo from './BrandLogo';

const TRUST_BADGES: Array<{ icon: LucideIcon; label: string }> = [
  { icon: BadgeCheck, label: 'Verified Platform' },
  { icon: Lock, label: 'Secure Escrow' },
  { icon: Scale, label: 'Dispute Protection' },
  { icon: ShieldCheck, label: 'Identity Verification' },
];

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
          <div className="hero-content max-w-2xl">
            {/* Brand block */}
            <div className="hero-brand">
              <BrandLogo
                width={56}
                height={56}
                priority
                className="ring-1 ring-white/10 rounded-xl"
              />
              <div>
                <p className="hero-eyebrow">Verified Platform</p>
                <p className="hero-tagline">Secure digital asset escrow</p>
              </div>
            </div>

            {/* Value proposition */}
            <div className="hero-copy">
              <h1 className="hero-headline">Trade Safely. Every Time.</h1>
              <p className="hero-description">
                TrustedMM holds funds in escrow, verifies every party, and manages trades end to
                end — so buyers and sellers never deal with each other directly.
              </p>
            </div>

            {/* Primary action */}
            <div className="hero-actions">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleStartTrade}
                  className="bg-accent text-accent-foreground px-6 py-3 rounded-xl font-semibold hover:bg-accent-hover transition-colors duration-200 text-base"
                >
                  Start Trade
                </button>
                <a
                  href="#how"
                  className="px-6 py-3 rounded-xl border border-white/15 text-white hover:bg-white/6 transition-colors duration-200 text-base font-medium"
                >
                  Learn More
                </a>
              </div>
              <p className="hero-cta-hint">Platform-managed assignment · No browsing required</p>
            </div>

            {/* Trust badges */}
            <div className="hero-trust-badges" aria-label="Why TrustedMM is trustworthy">
              {TRUST_BADGES.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.label} className="hero-trust-badge">
                    <span className="hero-trust-badge-icon" aria-hidden>
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="hero-trust-badge-label">{badge.label}</span>
                  </div>
                );
              })}
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
