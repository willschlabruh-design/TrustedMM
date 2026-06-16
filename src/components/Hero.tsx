import DashboardPreview from './DashboardPreview';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

export default function Hero(){
  const router = useRouter();
  const handleStartTrade = useCallback(async (e:any) => {
    e?.preventDefault?.();
    try{
      const r = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if(r.ok){ const j = await r.json(); if(j?.user){ router.push('/create-trade'); return; } }
    }catch(e){}
    router.push('/login?next=/create-trade');
  }, [router]);
  return (
    <section className="relative pt-28 pb-20 overflow-hidden bg-animated-gradient">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-8 relative z-20">
        <div className="flex-1 max-w-2xl">
          <img src="/api/assets/logo" alt="Trusted logo" className="w-16 h-16 rounded-lg mb-4" />
          <h1 className="text-5xl font-extrabold leading-tight">Trade Safely. Every Time.</h1>
          <p className="mt-4 text-slate-200 text-lg max-w-xl">Trusted acts as a secure middleman for digital asset transactions, protecting both buyers and sellers until the deal is complete.</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={handleStartTrade} className="bg-accent px-5 py-3 rounded-md font-semibold text-black hover:scale-105 transition">Start Trade</button>
            <a href="#how" className="px-5 py-3 rounded-md border border-white/6 hover:bg-white/6 transition">Learn More</a>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-green-400">✓</span>
              <span>Secure Escrow</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-green-400">✓</span>
              <span>Verified Middlemen</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-green-400">✓</span>
              <span>Fast Dispute Resolution</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-green-400">✓</span>
              <span>Thousands of Successful Trades</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex justify-center md:justify-end">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
