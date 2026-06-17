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
          content="Secure middleman service for digital asset transactions. TrustedMM protects buyers and sellers with verified escrow."
        />
        <meta
          property="og:description"
          content="Secure middleman service for digital asset transactions. TrustedMM protects buyers and sellers with verified escrow."
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
