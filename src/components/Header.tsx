import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Menu, X, MessageCircle, Bell } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { cn } from '../lib/cn';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setUser(data?.user ?? null);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setInterval> | undefined;
    async function fetchNotifs() {
      try {
        const r = await fetch('/api/notifications');
        if (!r.ok) return;
        const j = await r.json();
        if (!mounted) return;
        for (const n of j.notifications || []) {
          if (!n.read && (n.type === 'trade_created' || n.type === 'trade_completed')) {
            try {
              const payload = JSON.parse(n.payload || '{}');
              if (n.type === 'trade_created' && payload.roomId) {
                await fetch('/api/notifications', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: n.id }),
                });
                window.location.href = `/rooms/${payload.roomId}`;
                return;
              }
              if (n.type === 'trade_completed' && payload.tradeId) {
                await fetch('/api/notifications', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: n.id }),
                });
                window.location.href = `/trades/${payload.tradeId}/review`;
                return;
              }
            } catch {
              /* ignore */
            }
          }
        }
      } catch {
        /* ignore */
      }
    }
    if (user) {
      fetchNotifs();
      timer = setInterval(fetchNotifs, 5000);
    }
    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [user]);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setInterval> | undefined;
    async function fetchCounts() {
      try {
        if (!user) return;
        const [nr, rr] = await Promise.all([
          fetch('/api/notifications', { credentials: 'same-origin' }),
          fetch('/api/rooms', { credentials: 'same-origin' }),
        ]);
        if (!mounted) return;
        if (nr.ok) {
          const j = await nr.json();
          const unread = (j.notifications || []).filter((n: any) => !n.read).length;
          setUnreadNotifCount(unread);
        }
        if (rr.ok) {
          const j = await rr.json();
          const rooms = j.rooms || [];
          let unreadMsgs = 0;
          for (const r of rooms) {
            const last = r.messages?.[0];
            if (last && last.sender && last.sender.id !== user.id) unreadMsgs++;
          }
          setUnreadMsgCount(unreadMsgs);
        }
      } catch {
        /* ignore */
      }
    }
    if (user) {
      fetchCounts();
      timer = setInterval(fetchCounts, 6000);
    }
    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
    };
  }, [user]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
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

  const linkBase =
    'px-3 py-2 rounded-md transition-colors duration-200 text-white';
  const linkHover = 'hover:bg-white/10';
  const linkActive = 'bg-accent text-accent-foreground font-semibold';
  const linkBaseMobile = 'block px-3 py-2 rounded-md transition-colors duration-200 text-slate-900';
  const linkHoverMobile = 'hover:bg-slate-100';
  const linkActiveMobile = 'bg-accent text-accent-foreground font-semibold';

  return (
    <>
      <header className="site-header fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
              className="md:hidden text-white p-2 rounded-md hover:bg-white/10 transition-colors duration-200"
            >
              {open ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
            </button>
            <a href="/" className="shrink-0" aria-label="TrustedMM home">
              <BrandLogo width={44} height={44} priority />
            </a>
            <nav className="hidden md:flex gap-1 items-center ml-2">
              {navItems.map((item) => {
                const active = item.href === '/' ? path === '/' : path.startsWith(item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(linkBase, linkHover, active && linkActive)}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                );
              })}
              {isAdmin && (
                <a
                  href="/admin"
                  className={cn(linkBase, linkHover, path.startsWith('/admin') && linkActive)}
                  aria-current={path.startsWith('/admin') ? 'page' : undefined}
                >
                  Admin
                </a>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {!user && (
              <>
                <a href="/login" className="px-3 py-2 rounded-md hover:bg-white/10 transition-colors duration-200 text-sm">
                  Login
                </a>
                <a
                  href="/register"
                  className="hidden md:inline bg-white/6 px-3 py-2 rounded-md text-white hover:bg-white/10 transition-colors duration-200 text-sm"
                >
                  Sign up
                </a>
              </>
            )}
            {user && (
              <>
                <span className="hidden lg:inline text-sm text-slate-300 max-w-[10rem] truncate">
                  {user.username || user.name || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="hidden sm:inline bg-white/10 px-3 py-2 rounded-md hover:bg-white/15 transition-colors duration-200 text-sm"
                >
                  Logout
                </button>
              </>
            )}
            {user && (
              <>
                <a
                  href="/settings"
                  className="hidden lg:inline px-3 py-2 rounded-md hover:bg-white/10 transition-colors duration-200 text-sm"
                >
                  Settings
                </a>
                <a
                  href="/dashboard"
                  className="bg-white/10 px-3 py-2 rounded-md hover:bg-white/15 transition-colors duration-200 text-sm"
                >
                  Dashboard
                </a>
              </>
            )}
            <button
              onClick={() => {
                if (user) router.push('/create-trade');
                else router.push('/login?next=/create-trade');
              }}
              className="bg-accent text-accent-foreground px-4 py-2 rounded-md font-semibold hover:bg-accent-hover transition-colors duration-200 text-sm"
            >
              Start Trade
            </button>
            {user && (
              <>
                <a href="/messages" className="relative p-1 rounded-md hover:bg-white/10 transition-colors duration-200" aria-label="Messages">
                  <MessageCircle className="h-5 w-5 text-white" strokeWidth={2} />
                  {unreadMsgCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex min-w-[1.25rem] items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-600 rounded-full">
                      {unreadMsgCount > 99 ? '99+' : unreadMsgCount}
                    </span>
                  )}
                </a>
                <a href="/notifications" className="relative p-1 rounded-md hover:bg-white/10 transition-colors duration-200" aria-label="Notifications">
                  <Bell className="h-5 w-5 text-white" strokeWidth={2} />
                  {unreadNotifCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex min-w-[1.25rem] items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-600 rounded-full">
                      {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                    </span>
                  )}
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      <div className={cn('fixed inset-0 z-40 md:hidden', open ? 'pointer-events-auto' : 'pointer-events-none')}>
        <div
          className={cn(
            'fixed inset-0 bg-black transition-opacity duration-200',
            open ? 'opacity-40' : 'opacity-0'
          )}
          onClick={() => setOpen(false)}
          aria-hidden
        />
        <aside
          className={cn(
            'fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white text-slate-900 shadow-xl transform transition-transform duration-200 ease-out',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="p-4 flex items-center justify-between border-b border-slate-200">
            <a href="/" onClick={() => setOpen(false)}>
              <BrandLogo width={40} height={40} />
            </a>
            <button
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="p-2 rounded-md hover:bg-slate-100 transition-colors duration-200"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
          <nav className="flex flex-col p-4 gap-1">
            {!user && (
              <>
                <a href="/login" onClick={() => setOpen(false)} className={cn(linkBaseMobile, linkHoverMobile)}>
                  Login
                </a>
                <a
                  href="/register"
                  onClick={() => setOpen(false)}
                  className={cn(linkBaseMobile, linkActiveMobile, 'mt-2')}
                >
                  Sign up
                </a>
              </>
            )}
            {user && (
              <>
                <p className="px-3 py-2 text-sm text-slate-600 truncate">
                  {user.username || user.name || user.email}
                </p>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className={cn(linkBaseMobile, linkHoverMobile, 'text-left w-full')}
                >
                  Logout
                </button>
                <a
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className={cn(linkBaseMobile, linkHoverMobile, path.startsWith('/dashboard') && linkActiveMobile)}
                >
                  Dashboard
                </a>
                <a
                  href="/settings"
                  onClick={() => setOpen(false)}
                  className={cn(linkBaseMobile, linkHoverMobile, path.startsWith('/settings') && linkActiveMobile)}
                >
                  Settings
                </a>
              </>
            )}
            {isAdmin && (
              <a
                href="/admin"
                onClick={() => setOpen(false)}
                className={cn(linkBaseMobile, linkHoverMobile, path.startsWith('/admin') && linkActiveMobile)}
              >
                Admin
              </a>
            )}
            <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
              {navItems.map((item) => {
                const active = item.href === '/' ? path === '/' : path.startsWith(item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(linkBaseMobile, linkHoverMobile, active && linkActiveMobile)}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </nav>
        </aside>
      </div>
    </>
  );
}
