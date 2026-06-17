import Header from '../Header';
import Footer from '../Footer';
import { cn } from '../../lib/cn';

type AppShellProps = {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
};

/**
 * Global page shell: header + growing main + footer.
 * min-h-screen flex column keeps the footer at the viewport bottom on short pages.
 */
export default function AppShell({ children, showFooter = true, className = '' }: AppShellProps) {
  return (
    <div className={cn('flex min-h-screen flex-col bg-app-gradient text-white', className)}>
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      {showFooter && <Footer />}
    </div>
  );
}
