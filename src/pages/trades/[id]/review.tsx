import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Header from '../../../components/Header';

export default function TradeReview(){
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');

  async function submit(){
    if(!id) return;
    setStatus('Submitting...');
    const r = await fetch(`/api/trades/${id}/reviews`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ rating, text }) });
    const j = await r.json();
    if(r.ok){ setStatus('Review submitted'); router.push('/reviews'); }
    else setStatus('Error: ' + (j.error || 'Failed'));
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto px-6 py-24">
        <h1 className="text-2xl font-semibold mb-3">Leave a review for trade</h1>
        <div className="max-w-2xl bg-white/5 p-4 rounded">
          <label className="block mb-2">Rating</label>
          <div className="flex gap-2 mb-4">
            {[1,2,3,4,5].map(n=> (
              <button key={n} onClick={()=>setRating(n)} className={`px-3 py-2 rounded ${rating===n ? 'bg-accent text-black' : 'bg-white/10 text-white'}`}>{n}★</button>
            ))}
          </div>
          <label className="block mb-2">Review</label>
          <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full p-2 rounded bg-white/5 mb-4" rows={5} />
          <div className="flex items-center gap-3">
            <button onClick={submit} className="px-4 py-2 bg-accent text-black rounded">Submit Review</button>
            <div className="text-sm text-slate-300">{status}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
