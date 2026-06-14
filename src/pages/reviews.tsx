import Header from '../components/Header';
import { useEffect, useState } from 'react';

function useCurrentUser(){
  const [user, setUser] = useState<any>(null);
  useEffect(()=>{
    let mounted = true;
    fetch('/api/auth/me').then(r=>r.json()).then(j=>{ if(!mounted) return; setUser(j.user ?? null); }).catch(()=>{});
    return ()=>{ mounted = false };
  },[]);
  return user;
}

export default function Reviews(){
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useCurrentUser();

  useEffect(()=>{
    let mounted = true;
    (async ()=>{
      try{
        const r = await fetch('/api/reviews');
        if(!mounted) return;
        if(!r.ok){ setLoading(false); return; }
        const j = await r.json();
        setReviews(j.reviews || []);
      }catch(e){}
      setLoading(false);
    })();
    return ()=>{ mounted = false };
  },[]);

  return (
    <div className="min-h-screen bg-deep text-white">
      <Header />
      <main className="pt-36 container mx-auto px-6">
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="mt-3 text-slate-200">Verified reviews from completed trades.</p>

        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {loading && <div>Loading reviews…</div>}
          {!loading && reviews.length === 0 && <div className="text-slate-400">No reviews yet.</div>}
          {reviews.map(r=> (
            <div key={r.id} className="card-glass">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">{(r.author?.username||'U')[0]?.toUpperCase()}</div>
                <div>
                  <div className="font-semibold">{r.author?.username || r.author?.name || 'User'} — {'★'.repeat(r.rating) + '☆'.repeat(5-r.rating)}</div>
                  <div className="text-slate-300 mt-1">{r.text}</div>
                  <div className="text-sm text-slate-500 mt-2">For trade: {r.trade?.title ?? '—'}</div>
                  {user && user.role === 'ADMIN' && (
                    <div className="mt-2">
                      <button onClick={async ()=>{
                        if(!confirm('Delete this review? This cannot be undone.')) return;
                        try{
                          const resp = await fetch(`/api/reviews/${r.id}`, { method: 'DELETE' });
                          if(resp.ok){ setReviews(prev=>prev.filter(x=>x.id !== r.id)); }
                          else { const j = await resp.json(); alert('Failed: ' + (j.error || resp.statusText)); }
                        }catch(e){ alert('Failed to delete'); }
                      }} className="px-3 py-1 mt-1 bg-red-600 text-white rounded">Delete review</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
