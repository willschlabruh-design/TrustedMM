import Header from '../Header';
import Footer from '../Footer';

type AppShellProps = {
  children: React.ReactNode;
  showFooter?: boolean;
  className?: string;
};

export default function AppShell({ children, showFooter = true, className = '' }: AppShellProps) {
  return (
    <div className={`bg-app-gradient text-white ${className}`}>
      <Header />
      {children}
      {showFooter && <Footer />}
    </div>
  );
}
