import { useEffect, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';

const PROTECTION_ITEMS = [
  'Identity Verification Required',
  'Secure Escrow Protection',
  'Professional Dispute Resolution',
  'Verified Escrow Agents',
] as const;

const TRUST_STATS = [
  { value: '99.9%', label: 'Transaction Completion Rate' },
  { value: '24h', label: 'Average Response Time' },
  { value: 'Manual Review', label: 'Available' },
] as const;

export default function TrustProtectionCard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      className={`trust-card w-full max-w-lg transition-all duration-700 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <div className="trust-card-glow pointer-events-none" aria-hidden />

      <div className="relative z-10 flex flex-col gap-7 p-7 sm:gap-8 sm:p-9">
        <header>
          <p className="trust-card-eyebrow">Enterprise Protection</p>
          <h2 className="trust-card-title">Trust &amp; Protection</h2>
          <ul className="mt-5 space-y-3.5 sm:space-y-4" aria-label="Platform protections">
            {PROTECTION_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="trust-check-icon" aria-hidden>
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="text-[0.95rem] sm:text-base leading-snug text-slate-200">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </header>

        <div className="trust-stats-row">
          {TRUST_STATS.map((stat) => (
            <div key={stat.label} className="trust-stat-card">
              <p className="trust-stat-value">{stat.value}</p>
              <p className="trust-stat-label">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="trust-certification" role="note">
          <div className="trust-certification-icon" aria-hidden>
            <ShieldCheck className="h-5 w-5 text-emerald-400" strokeWidth={2} />
          </div>
          <div className="trust-certification-copy">
            <p className="trust-certification-title">Protected by TrustedMM</p>
            <p className="trust-certification-sub">Platform-verified escrow security</p>
          </div>
        </div>
      </div>
    </div>
  );
}
