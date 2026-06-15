import { useState } from 'react';
import Router from 'next/router';
import Header from '../components/Header';

export default function Register(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e:any)=>{
    e.preventDefault(); setError(null);
    if(!email || !password || !username) return setError('Email, username and password required');
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password, username }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Registration failed');
    alert('Account created. Please check your email and click the verification link to activate your account.');
    Router.push('/login');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-36 dark-text">
        <div className="container mx-auto px-6 max-w-md">
          <div className="form-dark">
          <h1 className="text-2xl font-bold mb-4">Create an account</h1>
          <form onSubmit={submit} className="space-y-3">
            <input className="w-full p-3 rounded" placeholder="Username (unique)" value={username} onChange={e=>setUsername(e.target.value)} />
            <input className="w-full p-3 rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
            <input type="password" className="w-full p-3 rounded" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
            {error && <div className="error">{error}</div>}
            <button className="btn-primary px-4 py-2 rounded">Register</button>
          </form>
          </div>
        </div>
      </div>
    </>
  );
}
