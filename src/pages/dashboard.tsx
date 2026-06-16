import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageShell from '../components/layout/PageShell';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  EmptyState,
  SkeletonCard,
  Modal,
} from '../components/ui';
import ActivityTimeline, { type TimelineEvent } from '../components/trade/ActivityTimeline';

type DashboardUser = {
  username: string;
  email?: string;
  verified: boolean;
  role: string;
  createdAt?: string;
};

type DashboardStats = {
  activeTrades: number;
  completedTrades: number;
  pendingTrades: number;
  reviews: number;
  user: DashboardUser | null;
};

const QUICK_ACTIONS = [
  {
    href: '/create-trade',
    title: 'Request a Trade',
    description: 'Submit a trade request for TrustedMM review and middleman assignment.',
    icon: '⚡',
    accent: 'from-amber-500/20 to-orange-500/10',
  },
  {
    href: '/how-it-works',
    title: 'How It Works',
    description: 'Learn how TrustedMM assigns middlemen and protects trades.',
    icon: '📋',
    accent: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    href: '/messages',
    title: 'Messages',
    description: 'View trade rooms and conversations.',
    icon: '💬',
    accent: 'from-blue-500/20 to-indigo-500/10',
  },
  {
    href: '/notifications',
    title: 'Notifications',
    description: 'Stay on top of trade updates and alerts.',
    icon: '🔔',
    accent: 'from-purple-500/20 to-violet-500/10',
  },
  {
    href: '/settings',
    title: 'Settings',
    description: 'Manage account, security, and preferences.',
    icon: '⚙️',
    accent: 'from-slate-500/20 to-slate-400/10',
  },
];

function roleLabel(role: string) {
  if (role === 'ADMIN') return 'Platform Admin';
  if (role === 'BANNED') return 'Restricted';
  return 'Standard Account';
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/dashboard/stats', { credentials: 'same-origin' });
        if (res.ok) setStats(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleDeleteAccount() {
    setDeleting(true);
    try {
      const r = await fetch('/api/account/delete', { method: 'POST', credentials: 'same-origin' });
      if (r.ok) {
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
        window.location.href = '/';
        return;
      }
      const j = await r.json();
      alert('Failed: ' + (j.error || r.statusText));
    } catch {
      alert('Failed to delete account');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  const user = stats?.user;
  const activityEvents: TimelineEvent[] = [];

  return (
    <PageShell maxWidth="2xl">
      {/* Welcome */}
      {loading ? (
        <Card className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className="h-8 w-64 app-skeleton rounded-lg" />
              <div className="h-4 w-48 app-skeleton rounded" />
            </div>
            <div className="h-10 w-32 app-skeleton rounded-full" />
          </div>
        </Card>
      ) : (
        <Card className="mb-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/5 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-400 mb-1">Welcome back</p>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {user?.username ?? 'Trader'}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge variant={user?.verified ? 'success' : 'warning'}>
                  {user?.verified ? '✓ Verified' : 'Verification Pending'}
                </Badge>
                <Badge variant={user?.role === 'ADMIN' ? 'purple' : 'default'}>
                  {user ? roleLabel(user.role) : 'Guest'}
                </Badge>
              </div>
            </div>
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-primary/20 border border-white/10 text-2xl font-bold text-white">
              {(user?.username ?? 'T').charAt(0).toUpperCase()}
            </div>
          </div>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard label="Active Trades" value={stats?.activeTrades ?? 0} icon="📊" />
            <StatCard label="Completed Trades" value={stats?.completedTrades ?? 0} icon="✅" />
            <StatCard label="Pending Trades" value={stats?.pendingTrades ?? 0} icon="⏳" />
            <VerificationStatCard verified={user?.verified ?? false} />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-3" padding="lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest trades, messages, and reviews.</CardDescription>
          </CardHeader>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-3 w-3 rounded-full app-skeleton shrink-0 mt-1" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 app-skeleton rounded" />
                    <div className="h-3 w-1/3 app-skeleton rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : activityEvents.length > 0 ? (
            <ActivityTimeline events={activityEvents} />
          ) : (
            <EmptyState
              icon="📭"
              title="No recent activity"
              description="When you start trades, send messages, or receive reviews, they'll show up here."
              actionLabel="Start a Trade"
              actionHref="/create-trade"
            />
          )}
        </Card>

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <CardHeader className="mb-0 px-1">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump to common tasks.</CardDescription>
          </CardHeader>
          <div className="grid gap-3">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href} className="block group">
                <Card hover padding="sm" className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.accent} border border-white/10 text-lg`}
                  >
                    {action.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white group-hover:text-accent transition-colors">
                      {action.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{action.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300 w-full"
              onClick={() => setDeleteOpen(true)}
            >
              Delete account
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        title="Delete your account?"
        footer={
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDeleteAccount}>
              Delete permanently
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-300 leading-relaxed">
          This will anonymize your data and sign you out. This action cannot be undone.
        </p>
      </Modal>
    </PageShell>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <Card hover className="app-stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white tabular-nums">
            {value.toLocaleString()}
          </p>
        </div>
        <span className="text-xl opacity-80" aria-hidden>
          {icon}
        </span>
      </div>
    </Card>
  );
}

function VerificationStatCard({ verified }: { verified: boolean }) {
  return (
    <Card hover className="app-stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">Verification Status</p>
          <p className="mt-2 text-xl font-bold tracking-tight text-white">
            {verified ? 'Verified' : 'Pending'}
          </p>
          <Badge variant={verified ? 'success' : 'warning'} className="mt-2">
            {verified ? 'Identity confirmed' : 'Action required'}
          </Badge>
        </div>
        <span className="text-xl opacity-80" aria-hidden>
          {verified ? '🛡️' : '⏱️'}
        </span>
      </div>
    </Card>
  );
}
