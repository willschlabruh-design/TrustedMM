import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';

export default function RoomPage(){
  const router = useRouter();
  const { id } = router.query;
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [watching, setWatching] = useState(false);

  useEffect(()=>{
    if(!id) return;
    let mounted = true;
    (async ()=>{
      const r = await fetch(`/api/rooms/${id}`);
      if(!mounted) return;
      if(!r.ok){ setLoading(false); return; }
      const j = await r.json();
      setRoom(j.room);
      // init watch state
      try{ const v = localStorage.getItem('watch_room_' + j.room.id); setWatching(v === '1'); }catch(e){}
      setLoading(false);
    })();
    return ()=>{ mounted = false };
  },[id]);

  useEffect(()=>{
    let mounted = true;
    fetch('/api/auth/me').then(r=>r.json()).then(j=>{ if(!mounted) return; setUser(j.user ?? null); }).catch(()=>{});
    return ()=>{ mounted = false };
  },[]);

  if(loading) return <div>Loading room...</div>;
  if(!room) return <div>Room not found</div>;

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-24">
        <h1 className="text-2xl font-semibold">Room for trade: {room.trade?.title ?? ''}</h1>
        <div className="mt-4 border rounded p-4 bg-white/5 max-w-3xl">
          {user && user.role === 'ADMIN' && (
            <div className="mb-4 flex gap-3">
              <button onClick={async ()=>{
                if(!confirm('Delete the message room for this trade? This cannot be undone.')) return;
                try{
                  const tradeId = room.trade?.id;
                  let resp;
                  if(tradeId){
                    resp = await fetch(`/api/admin/trades/${tradeId}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'deleteRoom' }) });
                  } else {
                    // fallback: delete by room id
                    resp = await fetch(`/api/admin/rooms/${room.id}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'deleteRoom' }) });
                  }
                  if(resp.ok){ alert('Room deleted'); router.push('/dashboard'); }
                  else { const j = await resp.json(); alert('Delete failed: ' + (j.error || resp.statusText)); }
                }catch(e){ alert('Delete failed'); }
              }} className="px-3 py-2 bg-red-600 text-white rounded">Delete Room</button>

              <button onClick={async ()=>{
                if(!confirm('Mark this trade as complete? This will prompt participants to leave reviews.')) return;
                try{
                  const tradeId = room.trade?.id;
                  const resp = await fetch(`/api/admin/trades/${tradeId}`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ action: 'complete' }) });
                  if(resp.ok){ alert('Trade marked complete'); const j = await resp.json(); if(j.roomId) window.open(`/rooms/${j.roomId}`, '_blank'); }
                  else { const j = await resp.json(); alert('Failed: ' + (j.error || resp.statusText)); }
                }catch(e){ alert('Failed'); }
              }} className="px-3 py-2 bg-green-600 text-white rounded">Mark Complete</button>

              <button onClick={()=>{ try{ window.open(`/rooms/${room.id}/watch`, '_blank'); }catch(e){ alert('Failed to open watch tab'); } }} className="px-3 py-2 rounded bg-white/10 text-white">Watch Deal Details</button>
            </div>
          )}
          <div id="messages" className="mb-4">
            {room.messages.map((m:any)=> (
              <div key={m.id} className="mb-2">
                <div className="text-sm text-slate-400">{m.sender?.username || m.sender?.email} • {new Date(m.createdAt).toLocaleString()}</div>
                <div className="mt-1">{m.body}</div>
              </div>
            ))}
          </div>
          <MessageInput roomId={room.id} />
        </div>
      </main>
    </div>
  );
}

function MessageInput({ roomId }: { roomId: string }){
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  async function send(){
    if(!text.trim()) return;
    setSending(true);
    try{
      const r = await fetch(`/api/rooms/${roomId}/messages`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ body: text }) });
      if(r.ok){ setText(''); window.location.reload(); }
    }catch(e){}
    setSending(false);
  }

  return (
    <div className="mt-3 flex gap-2">
      <input value={text} onChange={e=>setText(e.target.value)} className="flex-1 px-3 py-2 rounded bg-white/5" placeholder="Write a message..." />
      <button onClick={send} disabled={sending} className="px-4 py-2 bg-accent rounded text-black font-semibold">Send</button>
    </div>
  );
}
