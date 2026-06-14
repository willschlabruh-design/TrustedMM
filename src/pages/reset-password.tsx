import { useState } from 'react';
import Router from 'next/router';
import { useRouter } from 'next/router';

export default function ResetPassword(){
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { token } = router.query;

  const submit = async (e:any)=>{
    e.preventDefault(); setError(null);
    if(!token) return setError('Missing token');
    const res = await fetch('/api/auth/reset-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ token, password }) });
    const data = await res.json();
    if(!res.ok) return setError(data.error || 'Failed');
    Router.push('/login');
  };

  return (
    <div className="min-h-screen pt-36">
      <div className="container mx-auto px-6 max-w-md">
        <h1 className="text-2xl font-bold mb-4">Reset password</h1>
        <form onSubmit={submit} className="space-y-3">
          <input type="password" className="w-full p-3 rounded bg-white/6" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} />
          {error && <div className="text-red-400">{error}</div>}
          <button className="bg-accent px-4 py-2 rounded">Reset</button>
        </form>
      </div>
    </div>
  );
}
