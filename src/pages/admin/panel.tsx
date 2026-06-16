import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';

export default function AdminPanel(){
  const [me, setMe] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Record<string,string>>({});

  useEffect(()=>{
    (async()=>{
      const r = await fetch('/api/auth/me');
      const j = await r.json();
      setMe(j.user || null);
      if(!j.user) { setLoading(false); return; }
      if(j.user.role !== 'ADMIN'){ setLoading(false); return; }
      const ru = await fetch('/api/admin/users');
      if(ru.ok){ const data = await ru.json(); setUsers(data.users || []); }
      setLoading(false);
    })();
  },[]);

  async function ban(userId:string){
    await fetch('/api/admin/ban',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId }) });
    refresh();
  }
  async function unban(userId:string){
    await fetch('/api/admin/unban',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId }) });
    refresh();
  }
  async function refresh(){
    const ru = await fetch('/api/admin/users');
    if(ru.ok){ const data = await ru.json(); setUsers(data.users || []); }
  }

  async function setRole(userId: string, role: string){
    await fetch('/api/admin/set-role', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ userId, role }) });
    refresh();
  }

  if(loading) return <div>Loading...</div>;
  if(!me) return <div>Please log in as a platform admin.</div>;
  if(me.role !== 'ADMIN') return <div>Forbidden</div>;

  return (
    <div>
      <Header />
      <main className="min-h-screen bg-neutral-900 text-white pt-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold mb-2">Platform Admin Panel</h1>
          <p className="mb-4 text-slate-300">Signed in as {me.username}</p>
          <div className="mb-6">
            <a
              href="/admin/audit-logs"
              className="inline-flex px-4 py-2 rounded bg-primary text-white text-sm hover:opacity-90"
            >
              View Authentication Audit Logs
            </a>
          </div>
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <div className="overflow-x-auto bg-neutral-800 p-4 rounded">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left border-b border-neutral-700 bg-neutral-700">
                  <th className="p-3 text-white">Username</th>
                  <th className="p-3 text-white">Email</th>
                  <th className="p-3 text-white">Role</th>
                  <th className="p-3 text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u=> (
                  <tr key={u.id} className="border-t border-neutral-700">
                    <td className="p-3 text-white">{u.username}</td>
                    <td className="p-3 text-slate-300">{u.email}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <select value={editingRole[u.id] ?? u.role} onChange={(e)=>setEditingRole({...editingRole, [u.id]: e.target.value})} className="px-2 py-1 rounded border bg-neutral-700 text-white">
                          <option>USER</option>
                          
                          <option>ADMIN</option>
                          <option>BANNED</option>
                        </select>
                        <button onClick={()=>{ const role = editingRole[u.id] ?? u.role; setRole(u.id, role); }} className="px-3 py-1 bg-primary text-white rounded">Set role</button>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {u.role !== 'ADMIN' && (
                          <>
                            <button onClick={()=>ban(u.id)} className="px-3 py-1 bg-red-500 text-white rounded">Ban</button>
                            <button onClick={()=>unban(u.id)} className="px-3 py-1 bg-green-500 text-white rounded">Unban</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
