import { cn } from '../../lib/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-white/8 text-slate-200 border-white/10',
  success: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-200 border-amber-500/25',
  danger: 'bg-red-500/15 text-red-200 border-red-500/25',
  info: 'bg-blue-500/15 text-blue-200 border-blue-500/25',
  purple: 'bg-purple-500/15 text-purple-200 border-purple-500/25',
};

export default function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function tradeStatusVariant(status: string): BadgeVariant {
  const s = status.toUpperCase();
  if (s === 'COMPLETED') return 'success';
  if (s.includes('DISPUTE')) return 'danger';
  if (s.includes('WAITING') || s === 'PENDING') return 'warning';
  if (s.includes('VERIF')) return 'info';
  if (s.includes('ESCROW') || s === 'ACTIVE') return 'purple';
  return 'default';
}
