import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';

const STEPS = [
  { key: 'created', label: 'Created' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'verification', label: 'Verification' },
  { key: 'escrow', label: 'Escrow' },
  { key: 'completion', label: 'Completion' },
] as const;

function statusToStep(status: string): number {
  const s = status.toUpperCase();
  if (s === 'COMPLETED') return 4;
  if (s.includes('DISPUTE')) return 3;
  if (s.includes('ESCROW') || s === 'ACTIVE') return 3;
  if (s.includes('VERIF')) return 2;
  if (s.includes('WAITING') || s === 'PENDING') return 1;
  return 0;
}

export default function TradeProgress({ status }: { status: string }) {
  const current = statusToStep(status);

  return (
    <div className="app-trade-progress">
      <div className="app-trade-progress-track" aria-hidden />
      <ol className="grid grid-cols-5 gap-1 relative z-10">
        {STEPS.map((step, index) => {
          const done = index <= current;
          const active = index === current;
          return (
            <li key={step.key} className="flex flex-col items-center gap-2 text-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all',
                  done
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                    : 'bg-white/5 border-white/10 text-slate-500',
                  active && 'ring-2 ring-accent/40'
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-[10px] sm:text-xs leading-tight',
                  done ? 'text-slate-200' : 'text-slate-500'
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
