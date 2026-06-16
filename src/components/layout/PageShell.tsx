import Header from '../Header';
import Footer from '../Footer';
import { cn } from '../../lib/cn';

type PageShellProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  showFooter?: boolean;
};

const maxWidthMap = {
  md: 'max-w-3xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-[1400px]',
};

export default function PageShell({
  children,
  title,
  description,
  maxWidth = 'xl',
  className,
  showFooter = true,
}: PageShellProps) {
  return (
    <div className="min-h-screen bg-app-gradient text-white">
      <Header />
      <main
        className={cn(
          'app-page-main container mx-auto px-4 sm:px-6',
          maxWidthMap[maxWidth],
          className
        )}
      >
        {(title || description) && (
          <header className="mb-8 animate-slide-up">
            {title && (
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{title}</h1>
            )}
            {description && (
              <p className="mt-2 text-base text-slate-400 max-w-2xl">{description}</p>
            )}
          </header>
        )}
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
