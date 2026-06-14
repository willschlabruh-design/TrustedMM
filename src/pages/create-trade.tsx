import { useState } from 'react';
import Header from '../components/Header';
import { useRouter } from 'next/router';

export default function CreateTrade(){
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [buyerUsername, setBuyerUsername] = useState('');
  const [sellerUsername, setSellerUsername] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  return (
    <>
      <Header />
      <main className="container mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold">Create Trade</h1>
        <p className="mt-2 text-slate-400">Create a new escrow trade between you and a counterparty.</p>

        <form className="mt-6 max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-white/5" />
          </div>
          <div>
            <label className="block text-sm font-medium">Buyer username</label>
            <input value={buyerUsername} onChange={e=>setBuyerUsername(e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-white/5" />
          </div>
          <div>
            <label className="block text-sm font-medium">Seller username</label>
            <input value={sellerUsername} onChange={e=>setSellerUsername(e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-white/5" />
          </div>
          <div>
            <label className="block text-sm font-medium">State the deal</label>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-white/5" rows={4} />
          </div>
          <div>
            <label className="block text-sm font-medium">Amount</label>
            <input value={amount} onChange={e=>setAmount(e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-white/5" />
          </div>
          <div className="pt-4">
            <button
              type="button"
              onClick={async () => {
                setStatusMessage('Creating...');
                try {
                  const resp = await fetch('/api/trades/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, description, buyerUsername, sellerUsername, value: amount })
                  });
                  const data = await resp.json();
                  if (!resp.ok) throw new Error(data.error || 'Create failed');
                  // redirect to the created room
                  router.push(`/rooms/${data.roomId}`);
                } catch (err: any) {
                  setStatusMessage('Error: ' + err.message);
                }
              }}
              className="bg-accent px-4 py-2 rounded font-semibold"
            >Create Trade</button>
            {statusMessage && <div className="mt-2 text-sm text-slate-300">{statusMessage}</div>}
          </div>
        </form>
      </main>
    </>
  );
}
