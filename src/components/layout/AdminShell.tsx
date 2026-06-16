import PageShell from './PageShell';
import { cn } from '../../lib/cn';

const navItems = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/panel', label: 'Users' },
  { href: '/admin/trades', label: 'Trades' },
  { href: '/admin/audit-logs', label: 'Audit Logs' },
];

export default function AdminShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <PageShell title={title} description={description} maxWidth="2xl" showFooter={false}>
      <nav className="mb-8 flex flex-wrap gap-2" aria-label="Admin navigation">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium border transition-colors',
              'border-white/10 text-slate-300 hover:bg-white/8 hover:text-white'
            )}
          >
            {item.label}
          </a>
        ))}
      </nav>
      {children}
    </PageShell>
  );
}
