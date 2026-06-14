import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Link from 'next/link';

export default function AdminTrades(){
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(()=>{
    (async ()=>{
      const r = await fetch('/api/admin/trades');
      if(!r.ok) return;
      const j = await r.json();
      setTrades(j.trades || []);
    })();
  },[]);

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-24">
        <h1 className="text-2xl font-semibold mb-4">All Trades</h1>
        <div className="space-y-3">
          {trades.map(t=> (
            <div key={t.id} className="p-4 bg-white/5 rounded flex justify-between items-center">
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-sm text-slate-400">Status: {t.status} • Value: {t.value}</div>
              </div>
              <div>
                <Link href={`/admin/trades/${t.id}`} className="px-3 py-1 bg-accent rounded text-black font-semibold">View</Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
