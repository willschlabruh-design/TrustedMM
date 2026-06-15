import { useEffect, useState, useRef } from 'react';
import Header from '../components/Header';

type Stats = { activeTrades:number; completedTrades:number; reviews:number; totalValue:number };

export default function Dashboard(){
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  useEffect(()=>{
    (async ()=>{
      const res = await fetch('/api/dashboard/stats');
      if(res.ok){ setStats(await res.json()); }
      setLoading(false);
    })();
  },[]);

  // reveal cards when scrolled into view
  useEffect(()=>{
    const root = cardsRef.current;
    if(!root) return;
    const items = Array.from(root.querySelectorAll('.stat-card')) as HTMLElement[];
    const obs = new IntersectionObserver(entries=>{
      for(const e of entries){ if(e.isIntersecting){ e.target.classList.add('reveal'); } }
    },{ threshold: 0.2 });
    items.forEach(i=>obs.observe(i));
    return ()=>{ obs.disconnect(); };
  },[cardsRef.current]);

  return (
    <div className="min-h-screen bg-deep text-white">
      <Header />
      <main className="pt-36 container mx-auto px-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Active Trades" value={loading? null : stats?.activeTrades ?? 0} />
          <StatCard title="Completed Trades" value={loading? null : stats?.completedTrades ?? 0} />
          <StatCard title="Reviews Received" value={loading? null : stats?.reviews ?? 0} />
          <StatCard title="Total Trade Value" value={loading? null : (stats?.totalValue ?? 0)} prefix="$" />
        </div>

        <section className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="card-glass">
            <h3 className="font-semibold">Recent Activity</h3>
            <p className="mt-2 text-slate-300">Live feed of recent trades, messages, and reviews will appear here. When there is no activity we show an informative empty state.</p>
          </div>
          <div className="card-glass">
            <h3 className="font-semibold">Quick Actions</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              <a className="bg-accent text-black px-4 py-2 rounded" href="/create-trade">Create Trade</a>
              {/* Find Middleman removed — platform uses fixed admins/middlemen */}
              <a className="border border-white/10 px-4 py-2 rounded" href="/messages">Messages</a>
              <a className="border border-white/10 px-4 py-2 rounded" href="/notifications">Notifications</a>
              <button onClick={async ()=>{
                if(!confirm('Delete your account? This will anonymize your data and cannot be undone.')) return;
                try{
                  const r = await fetch('/api/account/delete', { method: 'POST' });
                  if(r.ok){ await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); window.location.href = '/'; }
                  else { const j = await r.json(); alert('Failed: ' + (j.error || r.statusText)); }
                }catch(e){ alert('Failed to delete account'); }
              }} className="border border-red-600 text-red-600 px-4 py-2 rounded">Delete account</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, prefix }: { title: string; value: number | null; prefix?: string }){
  const elRef = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState<string>(()=> value === null ? '—' : '0');

  useEffect(()=>{
    if(value === null) { setDisplay('—'); return; }
    let raf = 0;
    const start = performance.now();
    const from = 0;
    const to = value || 0;
    const duration = 900;
    function step(now:number){
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = Math.round(from + (to - from) * eased);
      setDisplay(cur.toLocaleString());
      if(t < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return ()=> cancelAnimationFrame(raf);
  },[value]);

  return (
    <div ref={elRef} className="stat-card card-glass opacity-0 transform translate-y-4 transition-all duration-500">
      <div className="text-sm text-slate-300">{title}</div>
      <div className="text-2xl font-bold">{value === null ? '—' : (prefix || '') + display}</div>
    </div>
  );
}
