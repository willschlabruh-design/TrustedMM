import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Header(){
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(()=>{
    let mounted = true;
    fetch('/api/auth/me').then(r=>r.json()).then(data=>{
      if(!mounted) return;
      setUser(data?.user ?? null);
    }).catch(()=>{});
    return ()=>{ mounted = false };
  },[]);

  // Poll notifications when user is present
  useEffect(()=>{
    let mounted = true;
    let timer: any;
    async function fetchNotifs(){
      try{
        const r = await fetch('/api/notifications');
        if(!r.ok) return;
        const j = await r.json();
        if(!mounted) return;
        setNotifications(j.notifications || []);
        // auto-redirect for trade_created or trade_completed
        for(const n of j.notifications || []){
          if(!n.read && (n.type === 'trade_created' || n.type === 'trade_completed')){
            try{
              const payload = JSON.parse(n.payload || '{}');
              if(n.type === 'trade_created' && payload.roomId){
                await fetch('/api/notifications', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: n.id }) });
                window.location.href = `/rooms/${payload.roomId}`;
                return;
              }
              if(n.type === 'trade_completed' && payload.tradeId){
                await fetch('/api/notifications', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ id: n.id }) });
                window.location.href = `/trades/${payload.tradeId}/review`;
                return;
              }
            }catch(e){ }
          }
        }
      }catch(e){}
    }
    if(user){ fetchNotifs(); timer = setInterval(fetchNotifs, 5000); }
    return ()=>{ mounted = false; if(timer) clearInterval(timer); };
  },[user]);

  // Poll unread counts (notifications and messages)
  useEffect(()=>{
    let mounted = true;
    let timer: any;
    async function fetchCounts(){
      try{
        if(!user) return;
        const [nr, rr] = await Promise.all([
          fetch('/api/notifications', { credentials: 'same-origin' }),
          fetch('/api/rooms', { credentials: 'same-origin' })
        ]);
        if(!mounted) return;
        if(nr.ok){ const j = await nr.json(); const unread = (j.notifications || []).filter((n:any)=>!n.read).length; setUnreadNotifCount(unread); }
        if(rr.ok){ const j = await rr.json(); // count rooms where latest message sender is not the current user
          const rooms = j.rooms || [];
          let unreadMsgs = 0;
          for(const r of rooms){ const last = r.messages?.[0]; if(last && last.sender && last.sender.id !== user.id) unreadMsgs++; }
          setUnreadMsgCount(unreadMsgs);
        }
      }catch(e){}
    }
    if(user){ fetchCounts(); timer = setInterval(fetchCounts, 6000); }
    return ()=>{ mounted = false; if(timer) clearInterval(timer); };
  },[user]);

  async function handleLogout(){
    await fetch('/api/auth/logout',{ method: 'POST' });
    setUser(null);
    window.location.href = '/';
  }

  const router = useRouter();
  const path = router.pathname || router.asPath || '/';

  const isAdmin = user && user.role === 'ADMIN';

  const navItems = [
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/trust-safety', label: 'Trust & Safety' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/faq', label: 'FAQ' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  const linkBase = 'px-3 py-2 rounded transition-colors text-white';
  const linkHover = 'hover:bg-white/10';
  const linkActive = 'bg-accent text-black font-semibold';
  const linkBaseMobile = 'block px-3 py-2 rounded transition-colors text-black';
  const linkHoverMobile = 'hover:bg-gray-100';
  const linkActiveMobile = 'bg-accent text-black font-semibold';

  return (
    <>
      {/* Top bar: small on mobile, full header on desktop */}
      <header className="bg-gradient-to-r from-primary to-indigo-500 fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile menu button (toggles open/close) */}
            <button aria-label="Toggle menu" onClick={()=>setOpen(o=>!o)} className="md:hidden text-white p-2 rounded hover:bg-white/10">
              {open ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <Link href="/">
              <img src="/api/assets/logo" alt="MiddleMan" className="w-10 h-10 rounded-full" />
            </Link>
            <nav className="hidden md:flex gap-3 items-center ml-4">
              {navItems.map(item => {
                const active = item.href === '/' ? path === '/' : path.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${linkBase} ${linkHover} ${active ? linkActive : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link href="/admin" className={`${linkBase} ${linkHover} ${path.startsWith('/admin') ? linkActive : ''}`} aria-current={path.startsWith('/admin') ? 'page' : undefined}>Admin</Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!user && (
              <>
                <Link href="/login" className="px-3 py-1 rounded">Login</Link>
                <Link href="/register" className="bg-accent px-3 py-2 rounded text-black font-semibold">Sign up</Link>
              </>
            )}
            {user && (
              <>
                <span className="hidden sm:inline">Signed in as {user.username || user.name || user.email}</span>
                <button onClick={handleLogout} className="bg-white/10 px-3 py-2 rounded">Logout</button>
              </>
            )}
            {user && (
              <Link href="/dashboard" className="bg-white/10 px-3 py-2 rounded">Dashboard</Link>
            )}
            {user && (
              <>
                <Link href="/messages" className="relative ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {unreadMsgCount > 0 && (
                    <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {unreadMsgCount > 99 ? '99+' : unreadMsgCount}
                    </span>
                  )}
                </Link>
                <Link href="/notifications" className="relative ml-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                    </span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      <div className="fixed inset-0 z-40 md:hidden">
        <div className={`fixed inset-0 bg-black transition-opacity duration-300 ${open ? 'opacity-40 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={()=>setOpen(false)} />
        <aside className={`fixed top-0 left-0 h-full w-64 bg-white text-black shadow-xl transform transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 flex items-center justify-between border-b">
            <Link href="/">
              <img src="/api/assets/logo" alt="MiddleMan" className="w-10 h-10 rounded-full" />
            </Link>
            <button aria-label="Close menu" onClick={()=>setOpen(false)} className="p-2 rounded hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col p-4 gap-3">
                <div className="border-t mt-2 pt-2">
                  {!user && (
                    <>
                      <Link href="/login" onClick={()=>setOpen(false)} className="block px-3 py-2 rounded hover:bg-gray-100">Login</Link>
                      <Link href="/register" onClick={()=>setOpen(false)} className="block bg-accent px-3 py-2 rounded text-black font-semibold mt-2">Sign up</Link>
                    </>
                  )}
                  {user && (
                    <>
                      <div className="px-3 py-2">Signed in as {user.username || user.name || user.email}</div>
                      <button onClick={()=>{ setOpen(false); handleLogout(); }} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100">Logout</button>
                    </>
                  )}
                  {user && (
                    <Link href="/dashboard" onClick={()=>setOpen(false)} className={`${linkBaseMobile} mt-3 ${path.startsWith('/dashboard') ? linkActiveMobile : ''}`}>Dashboard</Link>
                  )}

                  {isAdmin && (
                    <Link href="/admin" onClick={()=>setOpen(false)} className={`${linkBaseMobile} mt-2 ${path.startsWith('/admin') ? linkActiveMobile : ''}`}>Admin</Link>
                  )}

                  <div className="mt-3">
                    {navItems.map(item => {
                      const active = item.href === '/' ? path === '/' : path.startsWith(item.href);
                      return (
                        <Link key={item.href} href={item.href} onClick={()=>setOpen(false)} className={`${linkBaseMobile} ${linkHoverMobile} ${active ? linkActiveMobile : ''}`} aria-current={active ? 'page' : undefined}>{item.label}</Link>
                      );
                    })}
                  </div>
                </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
