import TrustProtectionCard from './TrustProtectionCard';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { BadgeCheck, Clock, Lock, Scale, ShieldCheck, UserCheck, CircleCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import BrandLogo from './BrandLogo';

const TRUST_INDICATORS: Array<{ icon: LucideIcon; label: string }> = [
  { icon: UserCheck, label: 'Identity Verified' },
  { icon: Lock, label: 'Secure Escrow' },
  { icon: Scale, label: 'Dispute Protection' },
  { icon: BadgeCheck, label: 'Verified Escrow Agents' },
];

const SOCIAL_PROOF: Array<{ icon: LucideIcon; label: string }> = [
  { icon: ShieldCheck, label: 'Trusted Platform' },
  { icon: CircleCheck, label: '99.9% Completion Rate' },
  { icon: UserCheck, label: 'Manual Review Available' },
  { icon: Clock, label: 'Fast Response Times' },
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
          <div className="hero-content">
            <div className="hero-brand">
              <BrandLogo width={56} height={56} priority className="ring-1 ring-white/10 rounded-xl" />
              <div>
                <p className="hero-eyebrow">Verified Platform</p>
                <p className="hero-tagline">Secure digital asset escrow</p>
              </div>
            </div>

            <div className="hero-copy">
              <h1 className="hero-headline">
                <span className="hero-headline-line">
                  Trade <span className="text-accent">Safely</span>.
                </span>
                <span className="hero-headline-line">Every Time.</span>
              </h1>
              <p className="hero-description">
                TrustedMM holds funds in escrow, verifies every party, and manages trades end-to-end
                so buyers and sellers never deal directly.
              </p>
            </div>

            <div className="hero-actions">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
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

            <div className="hero-trust-row" aria-label="Platform trust indicators">
              {TRUST_INDICATORS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="hero-trust-item">
                    <span className="hero-trust-item-icon" aria-hidden>
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="hero-trust-item-label">{item.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="hero-social-proof" aria-label="Platform credibility">
              <p className="hero-social-proof-title">Trusted by traders worldwide</p>
              <div className="hero-social-proof-grid">
                {SOCIAL_PROOF.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="hero-social-proof-item">
                      <Icon className="hero-social-proof-icon h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="hero-card-wrap">
            <TrustProtectionCard />
          </div>
        </div>
      </div>
    </section>
  );
}
