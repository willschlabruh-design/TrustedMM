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

export default function DashboardPreview() {
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

      <div className="relative z-10 flex flex-col gap-8 p-7 sm:p-9">
        {/* Section 1 — protections */}
        <header>
          <h2 className="text-2xl sm:text-[1.65rem] font-bold tracking-tight text-white">
            Trust &amp; Protection
          </h2>
          <ul className="mt-5 space-y-4" aria-label="Platform protections">
            {PROTECTION_ITEMS.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/30"
                  aria-hidden
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="text-base sm:text-[1.05rem] leading-snug text-slate-200">{item}</span>
              </li>
            ))}
          </ul>
        </header>

        {/* Section 2 — trust statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {TRUST_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-5 text-center sm:px-4"
            >
              <p className="text-2xl sm:text-[1.75rem] font-bold tracking-tight text-white">
                {stat.value}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Section 3 — platform badge */}
        <div className="trust-card-badge flex items-center justify-center gap-3 rounded-2xl px-6 py-4">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" strokeWidth={2} aria-hidden />
          <span className="text-sm sm:text-base font-semibold tracking-wide text-emerald-100">
            Protected by TrustedMM
          </span>
        </div>
      </div>
    </div>
  );
}
