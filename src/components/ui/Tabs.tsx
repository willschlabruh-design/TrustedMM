import { cn } from '../../lib/cn';

type Tab = { id: string; label: string };

export function Tabs({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn('flex flex-wrap gap-1 border-b border-white/10 pb-px', className)}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
            active === tab.id
              ? 'bg-white/8 text-white border-b-2 border-accent -mb-px'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('pt-6 animate-fade-in', className)}>{children}</div>;
}
