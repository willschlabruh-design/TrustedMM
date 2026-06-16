import { cn } from '../../lib/cn';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const styles: Record<AlertVariant, string> = {
  info: 'bg-blue-500/10 border-blue-500/25 text-blue-100',
  success: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-100',
  warning: 'bg-amber-500/10 border-amber-500/25 text-amber-100',
  error: 'bg-red-500/10 border-red-500/25 text-red-100',
};

export default function Alert({
  variant = 'info',
  title,
  children,
  className,
}: {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn('rounded-xl border px-4 py-3 text-sm', styles[variant], className)}
    >
      {title && <div className="font-semibold mb-1">{title}</div>}
      <div>{children}</div>
    </div>
  );
}
