import Header from '../components/Header';
import { useEffect, useState } from 'react';

export default function Messages(){
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    (async ()=>{
      const r = await fetch('/api/rooms');
      if(!r.ok){ setLoading(false); return; }
      const j = await r.json();
      const rooms = j.rooms || [];
      rooms.sort((a:any,b:any)=>{
        const aDate = a.messages?.[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : new Date(a.createdAt).getTime();
        const bDate = b.messages?.[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : new Date(b.createdAt).getTime();
        return bDate - aDate;
      });
      setRooms(rooms);
      setLoading(false);
    })();
  },[]);

  return (
    <>
      <Header />
      <main className="container mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="mt-4 text-slate-400">Your conversations appear here.</p>
        <div className="mt-6 grid gap-4">
          {loading && <div>Loading...</div>}
          {!loading && rooms.length === 0 && <div className="p-4 bg-white/5 rounded">No conversations yet</div>}
          {rooms.map(r=> (
            <a key={r.id} href={`/rooms/${r.id}`} className="block p-4 bg-white/5 rounded hover:bg-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{r.trade?.title || 'Trade'}</div>
                  <div className="text-sm text-slate-400">Participants: {r.members.map((m:any)=>m.user.username).join(', ')}</div>
                </div>
                <div className="text-sm text-slate-400">{r.messages?.[0]?.body ? r.messages[0].body.slice(0,40) : ''}</div>
              </div>
            </a>
          ))}
        </div>
      </main>
    </>
  );
}
