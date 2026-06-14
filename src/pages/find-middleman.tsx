import { useEffect, useState } from 'react';
import Header from '../components/Header';

type Middleman = { id:string; name?:string; avatarUrl?:string; rating?:number; createdAt?:string; verified?:boolean };

export default function FindMiddleman(){
  const [list, setList] = useState<Middleman[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(()=>{ fetchList(); },[]);
  async function fetchList(){ setLoading(true); const res = await fetch('/api/middlemen'); if(res.ok){ const data = await res.json(); setList(data.middlemen); } setLoading(false); }

  return (
    <div className="min-h-screen bg-deep text-white">
      <Header />
      <main className="pt-36 container mx-auto px-6">
        <h1 className="text-2xl font-bold mb-4">Find a Middleman</h1>
        <div className="flex gap-3 mb-6">
          <input value={q} onChange={e=>setQ(e.target.value)} className="flex-1 p-3 rounded bg-white/6" placeholder="Search by name or email" />
          <button className="bg-accent px-4 py-2 rounded" onClick={()=>{ fetch(`/api/middlemen?q=${encodeURIComponent(q)}`).then(r=>r.json()).then(d=>setList(d.middlemen)); }}>Search</button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {loading && <div className="col-span-full card-glass">Loading...</div>}
          {!loading && list.length === 0 && <div className="col-span-full card-glass">No middlemen found yet. Try adjusting filters.</div>}
          {list.map(m=> (
            <div key={m.id} className="card-glass">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">{m.name?.charAt(0) ?? 'M'}</div>
                <div>
                  <div className="font-semibold">{m.name ?? 'Unnamed'}</div>
                  <div className="text-sm text-slate-300">Rating: {m.rating ?? '—'}</div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <a className="px-3 py-1 rounded border" href={`/profile/${m.id}`}>View Profile</a>
                <a className="px-3 py-1 rounded bg-accent text-black" href="/create-trade">Request Trade</a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
