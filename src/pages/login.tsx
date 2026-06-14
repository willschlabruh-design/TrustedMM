import { useState } from 'react';
import Router from 'next/router';
import Header from '../components/Header';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async (e:any)=>{
    e.preventDefault(); setError(null); setRequiresVerification(false);
    const res = await fetch('/api/auth/login',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if(!res.ok){
      if(res.status === 403 && data.requiresVerification){
        setRequiresVerification(true);
        setUserId(data.userId);
        setError(data.error);
      } else {
        setError(data.error || 'Login failed');
      }
      return;
    }
    Router.push('/dashboard');
  };

  const resendVerification = async ()=>{
    if(!userId) return;
    setSending(true);
    try{
      const res = await fetch('/api/auth/resend-verification', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId }) });
      const data = await res.json();
      if(res.ok){
        alert('Verification email sent! Please check your inbox and click the link to verify your account.');
      } else {
        alert('Error: ' + (data.error || 'Failed to resend email'));
      }
    } catch(e){
      alert('Network error');
    }
    setSending(false);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-36">
        <div className="container mx-auto px-6 max-w-md">
          <div className="form-dark">
          <h1 className="text-2xl font-bold mb-4">Sign in</h1>
          <form onSubmit={submit} className="space-y-3">
            <input className="w-full p-3 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input type="password" className="w-full p-3 rounded" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
            {error && <div className={`p-3 rounded ${requiresVerification ? 'bg-yellow-900/30 text-yellow-200 border border-yellow-600' : 'error'}`}>{error}</div>}
            {requiresVerification && (
              <button type="button" onClick={resendVerification} disabled={sending} className="w-full px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700">
                {sending ? 'Sending...' : 'Resend Verification Email'}
              </button>
            )}
            <button className="btn-primary px-4 py-2 rounded w-full">Sign in</button>
          </form>
          </div>
        </div>
      </div>
    </>
  );
}
