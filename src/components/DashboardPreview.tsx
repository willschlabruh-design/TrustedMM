import { useEffect, useState } from 'react';

const PROTECTION_ITEMS = [
  {
    label: 'Identity Verification',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
        <path
          d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M6 20v-1a6 6 0 0 1 12 0v1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: 'Secure Escrow',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
        <rect
          x="4"
          y="10"
          width="16"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 10V7a4 4 0 0 1 8 0v3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: 'Dispute Protection',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
        <path
          d="M12 3 4 6v6c0 5 3.4 8.7 8 9 4.6-.3 8-4 8-9V6l-8-3Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="m9.5 12 1.8 1.8L15 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: 'Verified Middlemen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
        <path
          d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M8 7h8M8 11h8M8 15h5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const;

const TIMELINE_STEPS = [
  'Trade Opened',
  'Identity Verified',
  'Funds Secured',
  'Trade Completed',
] as const;

const SCORE_BADGES = [
  { label: 'Trust Score', value: '100%' },
  { label: 'Protected Transaction', value: 'Active' },
  { label: 'Verified Platform', value: 'TrustedMM' },
] as const;

function CheckIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <path
        d="m3.5 8.2 2.8 2.8 6.2-6.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DashboardPreview() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      className={`trust-dashboard w-full max-w-md text-white transition-all duration-700 ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
      }`}
    >
      <div className="trust-dashboard-glow pointer-events-none" aria-hidden />

      <div className="relative z-10 p-6 sm:p-7">
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="trust-dashboard-badge">Live Protection</span>
            <span className="trust-dashboard-pulse" aria-hidden />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            Trust &amp; Protection
          </h2>
          <p className="mt-1.5 text-sm text-white/60 leading-relaxed">
            Every trade is protected by our verification process
          </p>
        </header>

        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {PROTECTION_ITEMS.map((item, index) => (
            <div
              key={item.label}
              className="trust-protection-item group"
              style={{ animationDelay: `${120 + index * 80}ms` }}
            >
              <div className="trust-protection-icon">{item.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-medium text-white/90 truncate">
                  {item.label}
                </div>
              </div>
              <div className="trust-check-badge" aria-label="Complete">
                <CheckIcon />
              </div>
            </div>
          ))}
        </div>

        <div className="trust-timeline mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Protection Timeline
            </span>
            <span className="text-xs text-emerald-300/90 font-medium">All stages complete</span>
          </div>
          <div className="relative">
            <div className="trust-timeline-track" aria-hidden />
            <div className="grid grid-cols-4 gap-1 relative z-10">
              {TIMELINE_STEPS.map((step, index) => (
                <div
                  key={step}
                  className="trust-timeline-step"
                  style={{ animationDelay: `${280 + index * 100}ms` }}
                >
                  <div className="trust-timeline-node">
                    <CheckIcon className="w-3 h-3" />
                  </div>
                  <span className="trust-timeline-label">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="trust-score-widget">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <div className="text-xs text-white/50 mb-1">Security Score</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold bg-gradient-to-br from-blue-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                  100%
                </span>
                <span className="text-xs text-emerald-300/90 font-medium">Excellent</span>
              </div>
            </div>
            <div className="trust-score-ring" aria-hidden>
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="url(#trustScoreGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="94.2"
                  strokeDashoffset="0"
                  className="trust-score-ring-progress"
                />
                <defs>
                  <linearGradient id="trustScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {SCORE_BADGES.map((badge) => (
              <div key={badge.label} className="trust-score-badge">
                <div className="text-[10px] uppercase tracking-wide text-white/45 mb-0.5">
                  {badge.label}
                </div>
                <div className="text-xs font-semibold text-white/90">{badge.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
