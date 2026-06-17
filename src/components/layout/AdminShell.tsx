import AppShell from './AppShell';
import { cn } from '../../lib/cn';

type AdminShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
};

export default function AdminShell({ children, title, description, className }: AdminShellProps) {
  return (
    <AppShell>
      <main
        className={cn(
          'app-page-main flex-1 container mx-auto px-4 sm:px-6 max-w-7xl w-full',
          className
        )}
      >
        {(title || description) && (
          <header className="mb-8 animate-slide-up">
            {title && <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{title}</h1>}
            {description && <p className="mt-2 text-base text-slate-400 max-w-2xl">{description}</p>}
          </header>
        )}
        {children}
      </main>
    </AppShell>
  );
}
