import Head from 'next/head';
import AppShell from '../components/layout/AppShell';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import Pricing from '../components/Pricing';

export default function Home() {
  return (
    <AppShell>
      <Head>
        <meta
          name="description"
          content="Secure escrow platform for digital asset transactions. TrustedMM protects buyers and sellers with verified platform oversight."
        />
        <meta
          property="og:description"
          content="Secure escrow platform for digital asset transactions. TrustedMM protects buyers and sellers with verified platform oversight."
        />
      </Head>
      <main className="flex-1 text-white">
        <Hero />
        <HowItWorks />
        <Features />
        <Pricing />
      </main>
    </AppShell>
  );
}
