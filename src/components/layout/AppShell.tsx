import Header from '../Header';
import Footer from '../Footer';

type AppShellProps = {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
};

export default function AppShell({ children, showFooter = true, className = '' }: AppShellProps) {
  return (
    <div className={`flex min-h-screen flex-col bg-app-gradient text-white ${className}`}>
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      {showFooter && <Footer className="mt-auto" />}
    </div>
  );
}
