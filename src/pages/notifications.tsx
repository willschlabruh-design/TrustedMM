import Header from '../components/Header';
import { useEffect, useState } from 'react';

export default function Notifications(){
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  async function fetchNotifs(){
    try{ const r = await fetch('/api/notifications', { credentials: 'same-origin' }); if(!r.ok) return; const j = await r.json(); setNotifications(j.notifications || []); }catch(e){}
  }

  useEffect(()=>{ fetchNotifs(); }, []);

  useEffect(()=>{
    let mounted = true;
    fetch('/api/auth/me').then(r=>r.json()).then(j=>{ if(!mounted) return; setUser(j.user ?? null); }).catch(()=>{});
    return ()=>{ mounted = false };
  },[]);

  async function markRead(id:string){
    // optimistic UI: remove notification immediately
    const prev = notifications;
    setNotifications(prev.filter(n=>n.id !== id));
    try{
      const r = await fetch('/api/notifications', { method: 'POST', credentials: 'same-origin', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id }) });
      if(!r.ok){
        setNotifications(prev);
        const j = await r.json().catch(()=>({}));
        alert('Error: '+(j.error||r.statusText||'Unable to dismiss notification'));
      }
    }catch(e){
      setNotifications(prev);
      alert('Network error marking read');
    }
  }

  async function handleCreateChat(id:string){
    setLoading(true);
    try{
      const r = await fetch('/api/notifications/create-chat', { method: 'POST', credentials: 'same-origin', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id }) });
      const j = await r.json().catch(()=>({}));
      if(r.ok && j.roomId){ window.location.href = `/rooms/${j.roomId}`; return; }
      alert('Error: '+(j.error||r.statusText||'Unknown error'));
    }catch(e){ alert('Network error'); }
    setLoading(false);
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="mt-4 text-slate-400">Your recent notifications.</p>
        <div className="mt-6 space-y-4">
          {notifications.length === 0 && (
            <div className="p-4 bg-white/5 rounded">No new notifications</div>
          )}
          {notifications.map(n=>{
            const payload = (()=>{ try{ return JSON.parse(n.payload||'{}'); }catch(e){ return {}; } })();
            const when = new Date(n.createdAt).toLocaleString();
            // human-friendly render per type
            if(n.type === 'contact_message'){
              return (
                <div key={n.id} className={`p-4 rounded ${n.read? 'bg-white/3' : 'bg-white/6'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-semibold">New contact request</div>
                      <div className="text-sm text-slate-400 mt-1">From: {payload.email || 'Unknown'}</div>
                      <div className="text-sm text-slate-400 mt-2">{(payload.message||'').slice(0,300)}</div>
                      <div className="text-xs text-slate-500 mt-2">Received: {when}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button disabled={loading} onClick={()=>{ markRead(n.id); }} className="px-3 py-1 bg-red-600 text-white rounded">Ignore</button>
                      <button disabled={loading} onClick={()=>{ handleCreateChat(n.id); }} className="px-3 py-1 bg-green-600 text-white rounded">Create Chat</button>
                    </div>
                  </div>
                </div>
              );
            }

            if(n.type === 'message'){
              // payload may include roomId
              return (
                <div key={n.id} className={`p-4 rounded ${n.read? 'bg-white/3' : 'bg-white/6'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-semibold">New message</div>
                      <div className="text-sm text-slate-400 mt-1">{payload.roomId ? `Conversation: ${payload.roomId}` : 'You have a new message.'}</div>
                      <div className="text-xs text-slate-500 mt-2">Received: {when}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button disabled={loading} onClick={()=>{ markRead(n.id); }} className="px-3 py-1 bg-red-600 text-white rounded">Dismiss</button>
                      {payload.roomId && <button disabled={loading} onClick={()=>{ window.location.href = `/rooms/${payload.roomId}`; }} className="px-3 py-1 bg-green-600 text-white rounded">Open</button>}
                    </div>
                  </div>
                </div>
              );
            }

            if(n.type === 'trade_created'){
              const tradeId = payload.tradeId || payload.tradeid || payload.tradeID;
              const roomId = payload.roomId || payload.roomid;
              return (
                <div key={n.id} className={`p-4 rounded ${n.read? 'bg-white/3' : 'bg-white/6'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-semibold">New trade created</div>
                      <div className="text-sm text-slate-400 mt-1">{tradeId ? `Trade ID: ${tradeId}` : 'A new trade was created.'}</div>
                      <div className="text-xs text-slate-500 mt-2">Received: {when}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button disabled={loading} onClick={()=>{ markRead(n.id); }} className="px-3 py-1 bg-red-600 text-white rounded">Ignore</button>
                      {roomId && <button disabled={loading} onClick={()=>{ window.location.href = `/rooms/${roomId}`; }} className="px-3 py-1 bg-green-600 text-white rounded">Open Chat</button>}
                      {tradeId && <button disabled={loading} onClick={()=>{ window.location.href = `/trades/${tradeId}`; }} className="px-3 py-1 bg-white/5 text-white rounded">View Trade</button>}
                    </div>
                  </div>
                </div>
              );
            }

            if(n.type === 'middleman_needed'){
              return <MiddlemanNotification key={n.id} n={n} payload={payload} when={when} markRead={markRead} />;
            }

            if(n.type === 'trade_completed'){
              const tradeId = payload.tradeId || payload.tradeid || payload.tradeID;
              return (
                <div key={n.id} className={`p-4 rounded ${n.read? 'bg-white/3' : 'bg-white/6'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="font-semibold">Trade completed</div>
                      <div className="text-sm text-slate-400 mt-1">{tradeId ? `Trade ID: ${tradeId}` : 'A trade was completed.'}</div>
                      <div className="text-xs text-slate-500 mt-2">Received: {when}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button disabled={loading} onClick={()=>{ markRead(n.id); }} className="px-3 py-1 bg-red-600 text-white rounded">Dismiss</button>
                      {tradeId && <button disabled={loading} onClick={()=>{ window.location.href = `/trades/${tradeId}/review`; }} className="px-3 py-1 bg-green-600 text-white rounded">Review</button>}
                    </div>
                  </div>
                </div>
              );
            }

            // fallback: show a small friendly summary with type and brief payload preview
            return (
              <div key={n.id} className={`p-4 rounded ${n.read? 'bg-white/3' : 'bg-white/6'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="font-semibold">{n.type.replace(/_/g,' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</div>
                    <div className="text-sm text-slate-400 mt-1">{typeof n.payload === 'string' ? n.payload.slice(0,200) : JSON.stringify(payload).slice(0,200)}</div>
                    <div className="text-xs text-slate-500 mt-2">Received: {when}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button disabled={loading} onClick={()=>{ markRead(n.id); }} className="px-3 py-1 bg-red-600 text-white rounded">Dismiss</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

function MiddlemanNotification({ n, payload, when, markRead } : any){
  const [loading, setLoading] = useState(false);
  const [trade, setTrade] = useState<any>(null);

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const id = payload.tradeId || payload.tradeid;
        if(!id) return;
        const r = await fetch(`/api/admin/trades/${id}`, { credentials: 'same-origin' });
        if(!mounted) return;
        if(r.ok){ const j = await r.json(); setTrade(j.trade); }
      }catch(e){ }
    })();
    return ()=>{ mounted = false };
  },[payload]);

  useEffect(()=>{
    if(trade && trade.middlemanId){
      // auto-dismiss the notification if trade already assigned
      try{ markRead(n.id); }catch(e){}
    }
  },[trade]);

  return (
    <div className={`p-4 rounded ${n.read? 'bg-white/3' : 'bg-white/6'}`}>
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="font-semibold">Middleman requested</div>
          <div className="text-sm text-slate-400 mt-1">{payload.tradeId ? `Trade ID: ${payload.tradeId}` : 'A trade needs a middleman.'}</div>
          <div className="text-xs text-slate-500 mt-2">Received: {when}</div>
          {trade && trade.middlemanId && (
            <div className="text-sm text-white/70 mt-2">Already assigned: {trade.middleman?.username || trade.middlemanId}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button disabled={loading} onClick={()=>{ markRead(n.id); }} className="px-3 py-1 bg-red-600 text-white rounded">Dismiss</button>
          {payload.roomId && <button disabled={loading} onClick={()=>{ window.location.href = `/rooms/${payload.roomId}`; }} className="px-3 py-1 bg-green-600 text-white rounded">Open Chat</button>}
          {payload.tradeId && <button disabled={loading} onClick={()=>{ window.location.href = `/trades/${payload.tradeId}`; }} className="px-3 py-1 bg-white/5 text-white rounded">View Trade</button>}
          {/* Accept only if trade not assigned yet */}
          {!trade && <div className="text-sm text-slate-500">Checking trade...</div>}
          {trade && !trade.middlemanId && (
            <button disabled={loading} onClick={async ()=>{
              setLoading(true);
              try{
                const r = await fetch('/api/trades/accept-middleman', { method: 'POST', credentials: 'same-origin', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ tradeId: payload.tradeId }) });
                const j = await r.json().catch(()=>({}));
                if(r.ok){ alert('You are now the middleman for this trade'); markRead(n.id); window.location.href = `/trades/${payload.tradeId}`; return; }
                alert('Error: ' + (j.error || r.statusText || 'Unable to accept') + (j.trade ? '\n\n' + JSON.stringify(j.trade, null, 2) : ''));
              }catch(e){ alert('Network error'); }
              setLoading(false);
            }} className="px-3 py-1 bg-blue-600 text-white rounded">Accept</button>
          )}
        </div>
      </div>
    </div>
  );
}
