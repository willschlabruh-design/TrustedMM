import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import AdminShell from '../../../components/layout/AdminShell';
import Card, { CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { Skeleton, SkeletonCard } from '../../../components/ui/Skeleton';
import StatusBadge from '../../../components/trade/StatusBadge';
import TradeProgress from '../../../components/trade/TradeProgress';
import ActivityTimeline, { type TimelineEvent } from '../../../components/trade/ActivityTimeline';

type Trade = {
  id: string;
  title: string;
  status: string;
  value: number | string;
  createdAt?: string;
  updatedAt?: string;
  buyer?: { username?: string };
  seller?: { username?: string };
  middleman?: { username?: string };
  middlemanId?: string;
};

function formatTimestamp(value?: string): string {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function buildTimeline(trade: Trade): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  if (trade.createdAt) {
    events.push({
      id: 'created',
      title: 'Trade created',
      description: trade.title,
      timestamp: formatTimestamp(trade.createdAt),
      type: 'info',
    });
  }

  if (trade.buyer?.username) {
    events.push({
      id: 'buyer',
      title: 'Buyer assigned',
      description: trade.buyer.username,
      timestamp: formatTimestamp(trade.createdAt),
      type: 'default',
    });
  }

  if (trade.seller?.username) {
    events.push({
      id: 'seller',
      title: 'Seller assigned',
      description: trade.seller.username,
      timestamp: formatTimestamp(trade.createdAt),
      type: 'default',
    });
  }

  if (trade.middleman?.username || trade.middlemanId) {
    events.push({
      id: 'middleman',
      title: 'Platform assignment',
      description: trade.middleman?.username || trade.middlemanId,
      timestamp: formatTimestamp(trade.updatedAt || trade.createdAt),
      type: 'success',
    });
  }

  events.push({
    id: 'status',
    title: 'Current status',
    description: trade.status.replace(/_/g, ' '),
    timestamp: formatTimestamp(trade.updatedAt || trade.createdAt),
    type: trade.status === 'COMPLETED' ? 'success' : 'warning',
  });

  return events;
}

export default function AdminTradeDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const r = await fetch(`/api/admin/trades/${id}`);
      if (r.ok) {
        const j = await r.json();
        setTrade(j.trade);
      }
      setLoading(false);
    })();
  }, [id]);

  const timeline = useMemo(() => (trade ? buildTimeline(trade) : []), [trade]);

  if (loading || !trade) {
    return (
      <AdminShell title="Trade Detail" description="Loading trade information…">
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <SkeletonCard />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title={trade.title}
      description={`Trade ID: ${trade.id}`}
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={trade.status} />
        <Badge variant="default">Value: {trade.value}</Badge>
        <a href="/admin/trades">
          <Button variant="ghost" size="sm">
            ← Back to trades
          </Button>
        </a>
      </div>

      <Card padding="lg" className="mb-6">
        <CardHeader>
          <CardTitle>Trade progress</CardTitle>
          <CardDescription>Current stage in the escrow lifecycle</CardDescription>
        </CardHeader>
        <TradeProgress status={trade.status} />
      </Card>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <Card padding="md">
          <CardHeader>
            <CardTitle>Participants</CardTitle>
          </CardHeader>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <dt className="text-slate-400">Buyer</dt>
              <dd className="font-medium text-white">{trade.buyer?.username || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/5 pb-3">
              <dt className="text-slate-400">Seller</dt>
              <dd className="font-medium text-white">{trade.seller?.username || '—'}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-400">Platform oversight</dt>
              <dd className="font-medium text-white">
                {trade.middleman?.username || trade.middlemanId || '—'}
              </dd>
            </div>
          </dl>
        </Card>

        <Card padding="md">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Key events for this trade</CardDescription>
          </CardHeader>
          <ActivityTimeline events={timeline} />
        </Card>
      </div>

      <Card padding="md">
        <CardHeader>
          <CardTitle>Admin actions</CardTitle>
          <CardDescription>Manage room and completion status</CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="danger"
            onClick={async () => {
              if (!confirm('Delete the message room for this trade? This cannot be undone.')) return;
              const resp = await fetch(`/api/admin/trades/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'deleteRoom' }),
              });
              if (resp.ok) alert('Room deleted');
              else alert('Delete failed');
            }}
          >
            Delete Room
          </Button>

          <Button
            variant="primary"
            onClick={async () => {
              if (
                !confirm(
                  'Mark this trade as complete? This will prompt participants to leave reviews.'
                )
              )
                return;
              const resp = await fetch(`/api/admin/trades/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'complete' }),
              });
              if (resp.ok) {
                alert('Trade marked complete');
                const j = await resp.json();
                if (j.roomId) window.open(`/rooms/${j.roomId}`, '_blank');
              } else alert('Failed to mark complete');
            }}
          >
            Mark Complete
          </Button>

          <WatchButton id={id as string} />
        </div>
      </Card>
    </AdminShell>
  );
}

function WatchButton({ id }: { id: string }) {
  const [watching, setWatching] = useState(false);

  useEffect(() => {
    const v = localStorage.getItem('watch_trade_' + id);
    setWatching(v === '1');
  }, [id]);

  return (
    <Button
      variant={watching ? 'secondary' : 'outline'}
      onClick={() => {
        const next = !watching;
        setWatching(next);
        localStorage.setItem('watch_trade_' + id, next ? '1' : '0');
      }}
    >
      {watching ? 'Watching' : 'Watch Deal Details'}
    </Button>
  );
}
