import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '../../../components/Header';

export default function AdminTradeDetail(){
  const router = useRouter();
  const { id } = router.query;
  const [trade, setTrade] = useState<any>(null);

  useEffect(()=>{
    if(!id) return;
    (async ()=>{
      const r = await fetch(`/api/admin/trades/${id}`);
      if(!r.ok) return;
      const j = await r.json();
      setTrade(j.trade);
    })();
  },[id]);

  if(!trade) return <div><Header /><main className="container mx-auto px-6 py-24">Loading...</main></div>;

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-24">
        <h1 className="text-2xl font-semibold">Trade: {trade.title}</h1>
        <p className="mt-2 text-slate-400">Status: {trade.status} • Value: {trade.value}</p>
        <div className="mt-4 bg-white/5 p-4 rounded">
          <h2 className="font-semibold">Participants</h2>
          <div>Buyer: {trade.buyer?.username}</div>
          <div>Seller: {trade.seller?.username}</div>
          <div>Middleman: {trade.middleman?.username}</div>
        </div>

        <div className="mt-4 flex gap-3">
          <button onClick={async ()=>{
            if(!confirm('Delete the message room for this trade? This cannot be undone.')) return;
            const resp = await fetch(`/api/admin/trades/${id}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'deleteRoom' }) });
            if(resp.ok) alert('Room deleted'); else alert('Delete failed');
          }} className="px-4 py-2 bg-red-600 text-white rounded">Delete Room</button>

          <button onClick={async ()=>{
            if(!confirm('Mark this trade as complete? This will prompt participants to leave reviews.')) return;
            const resp = await fetch(`/api/admin/trades/${id}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'complete' }) });
            if(resp.ok){ alert('Trade marked complete'); const j = await resp.json(); if(j.roomId) window.open(`/rooms/${j.roomId}`, '_blank'); }
            else alert('Failed to mark complete');
          }} className="px-4 py-2 bg-green-600 text-white rounded">Mark Complete</button>

          <WatchButton id={id as string} />
        </div>
      </main>
    </div>
  );
}

function WatchButton({ id }: { id: string }){
  const [watching, setWatching] = useState(false);
  useEffect(()=>{ const v = localStorage.getItem('watch_trade_' + id); setWatching(v === '1'); },[id]);
  return (
    <button onClick={()=>{ const next = !watching; setWatching(next); localStorage.setItem('watch_trade_' + id, next ? '1' : '0'); }} className={`px-4 py-2 rounded ${watching ? 'bg-yellow-500 text-black' : 'bg-white/10 text-white'}`}>{watching ? 'Watching' : 'Watch Deal Details'}</button>
  );
}
