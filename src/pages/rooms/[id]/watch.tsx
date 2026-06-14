import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '../../../components/Header';

export default function RoomWatch(){
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    if(!id) return;
    let mounted = true;
    (async ()=>{
      const r = await fetch(`/api/rooms/${id}`);
      if(!mounted) return;
      if(!r.ok){ setLoading(false); return; }
      const j = await r.json();
      setRoom(j.room);
      setLoading(false);
    })();
    return ()=>{ mounted = false };
  },[id]);

  if(loading) return <div>Loading...</div>;
  if(!room) return <div>Room not found</div>;

  const trade = room.trade || {};

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-24">
        <h1 className="text-2xl font-semibold">Watching submitted form for: {trade.title}</h1>
        <div className="mt-4 bg-white/5 p-4 rounded max-w-3xl">
          <h2 className="font-semibold">Trade Details</h2>
          <div className="mt-2"><strong>Title:</strong> {trade.title}</div>
          <div className="mt-2"><strong>Description:</strong>
            <div className="mt-1 whitespace-pre-wrap">{trade.description}</div>
          </div>
          <div className="mt-2"><strong>Platform:</strong> {trade.platform || '—'}</div>
          <div className="mt-2"><strong>Value:</strong> {trade.value ?? '—'}</div>
          <div className="mt-4">
            <h3 className="font-semibold">Files</h3>
            {trade.files?.length ? (
              <ul className="mt-2">
                {trade.files.map((f:any)=>(<li key={f.id}><a href={f.url} target="_blank" rel="noreferrer" className="text-accent underline">{f.filename}</a></li>))}
              </ul>
            ) : <div className="mt-1 text-slate-400">No files uploaded</div>}
          </div>
        </div>
      </main>
    </div>
  );
}
