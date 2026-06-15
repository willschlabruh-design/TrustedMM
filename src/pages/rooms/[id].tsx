import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
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
                try{
                  const r = await fetch(`/api/rooms/${room.id}/join`, { method: 'POST', credentials: 'same-origin' });
                  if(r.ok){ alert('You have joined the room'); window.location.reload(); }
                  else { const j = await r.json().catch(()=>({})); alert('Failed to join: ' + (j.error || r.statusText)); }
                }catch(e){ alert('Network error'); }
              }} className="px-3 py-2 bg-blue-600 text-white rounded">Join Room</button>
              {/* If trade needs a middleman, allow admins to accept */}
              {room.trade && room.trade.status === 'WAITING_FOR_MIDDLEMEN' && !room.trade.middlemanId && (
                <button onClick={async ()=>{
                  if(!confirm('Accept middleman role for this trade?')) return;
                  try{
                    const resp = await fetch('/api/trades/accept-middleman', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ tradeId: room.trade.id }) });
                    if(resp.ok){ alert('You are now the middleman for this trade'); window.location.reload(); }
                    else { const j = await resp.json(); alert('Failed: ' + (j.error || resp.statusText)); }
                  }catch(e){ alert('Request failed'); }
                }} className="px-3 py-2 bg-blue-600 text-white rounded">Join as Middleman</button>
              )}
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
                {m.attachments?.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {m.attachments.map((f:any)=>(
                      <a key={f.id} href={f.url} target="_blank" rel="noreferrer"><img src={f.url} alt={f.filename} className="w-28 h-28 object-cover rounded" /></a>
                    ))}
                  </div>
                )}
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
  const [files, setFiles] = useState<File[]>([] as File[]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(()=>{
    function onPaste(e: ClipboardEvent){
      if(!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items || []);
      const imageItems = items.filter(i=>i.type.startsWith('image/'));
      if(imageItems.length){
        e.preventDefault();
        imageItems.forEach(it=>{
          const f = it.getAsFile();
          if(f) setFiles(prev=>[...prev, f]);
        });
      }
    }
    window.addEventListener('paste', onPaste as any);
    return ()=> window.removeEventListener('paste', onPaste as any);
  },[]);

  async function send(){
    if(!text.trim() && files.length === 0) return;
    setSending(true);
    try{
      // prepare attachments as base64
      const attachments: any[] = [];
      for(const f of files){
        const data = await new Promise<string>((resolve, reject)=>{
          const fr = new FileReader();
          fr.onload = ()=>{ const res = fr.result as string; const b = res.split(',')[1]; resolve(b); };
          fr.onerror = ()=>reject(fr.error);
          fr.readAsDataURL(f);
        });
        attachments.push({ filename: f.name, data, mime: f.type });
      }

      const r = await fetch(`/api/rooms/${roomId}/messages`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ body: text, attachments }) });
      if(r.ok){ setText(''); window.location.reload(); }
    }catch(e){}
    setSending(false);
  }

  return (
    <div className="mt-3 flex gap-2">
      <div className="flex-1">
        <input value={text} onChange={e=>setText(e.target.value)} className="w-full px-3 py-2 rounded bg-white/5" placeholder="Write a message..." />
        {files.length > 0 && (
          <div className="mt-2 flex gap-2">
            {files.map((f, i)=>(
              <div key={i} className="p-2 bg-white/6 rounded flex items-center gap-2">
                <img src={URL.createObjectURL(f)} alt={f.name} className="w-12 h-12 object-cover rounded" />
                <div className="text-sm">{f.name}</div>
                <button onClick={()=>setFiles(prev=>prev.filter((_,idx)=>idx!==i))} className="ml-2 px-2 py-1 bg-red-600 text-white rounded">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input ref={el => { fileRef.current = el }} type="file" accept="image/*" multiple onChange={e=>{ const fl = e.target.files; if(fl) setFiles(prev=>[...prev, ...Array.from(fl)]); e.currentTarget.value=''; }} className="hidden" />
        <button onClick={()=>fileRef.current?.click()} className="px-3 py-2 bg-white/6 rounded">Attach</button>
        <button onClick={send} disabled={sending} className="px-4 py-2 bg-accent rounded text-black font-semibold">Send</button>
      </div>
    </div>
  );
}
