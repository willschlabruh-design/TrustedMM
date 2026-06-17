import '../styles/globals.css';
import type { AppProps } from 'next/app';
import CookieConsent from '../components/CookieConsent';
import SiteHead from '../components/seo/SiteHead';
import { useThemeBootstrap } from '../lib/theme';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useThemeBootstrap();
  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <SiteHead />
      <Component {...pageProps} />
      <CookieConsent />
    </ThemeProvider>
  );
}
