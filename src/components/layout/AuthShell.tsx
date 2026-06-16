import Header from '../Header';
import Card from '../ui/Card';
import { cn } from '../../lib/cn';

type AuthShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  wide?: boolean;
};

export default function AuthShell({ children, title, subtitle, footer, wide }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-app-gradient text-white">
      <Header />
      <div className="app-page-main container mx-auto px-4 sm:px-6 flex items-center justify-center py-8">
        <div className={cn('w-full animate-slide-up', wide ? 'max-w-lg' : 'max-w-md')}>
          <Card padding="lg" className="relative overflow-hidden">
            <div
              className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/80 mb-2">
                  TrustedMM
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{title}</h1>
                {subtitle && <p className="mt-2 text-sm text-slate-400">{subtitle}</p>}
              </div>
              {children}
              {footer && <div className="mt-6 pt-4 border-t border-white/8">{footer}</div>}
            </div>
          </Card>
          <p className="mt-6 text-center text-xs text-slate-500">
            Protected by TrustedMM security · Encrypted connections
          </p>
        </div>
      </div>
    </div>
  );
}
