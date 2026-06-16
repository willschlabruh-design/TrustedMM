import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PageShell from '../../../components/layout/PageShell';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Alert,
  EmptyState,
  Skeleton,
} from '../../../components/ui';
import TradeProgress from '../../../components/trade/TradeProgress';
import StatusBadge from '../../../components/trade/StatusBadge';

type TradeFile = {
  id: string;
  url: string;
  filename: string;
};

type Trade = {
  id?: string;
  title?: string;
  description?: string;
  platform?: string;
  value?: number | string;
  status?: string;
  files?: TradeFile[];
};

type Room = {
  id: string;
  trade?: Trade;
};

function WatchSkeleton() {
  return (
    <div className="space-y-6 animate-slide-up">
      <Card>
        <Skeleton className="h-6 w-56 mb-3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </Card>
      <Card>
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </Card>
      <Card>
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </Card>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-white/6 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </dt>
      <dd className="text-sm text-slate-200">{children}</dd>
    </div>
  );
}

export default function RoomWatch() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      const r = await fetch(`/api/rooms/${id}`);
      if (!mounted) return;
      if (!r.ok) {
        setLoading(false);
        return;
      }
      const j = await r.json();
      setRoom(j.room);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <PageShell title="Deal Watch" maxWidth="lg" showFooter={false}>
        <WatchSkeleton />
      </PageShell>
    );
  }

  if (!room) {
    return (
      <PageShell title="Deal Watch" maxWidth="lg" showFooter={false}>
        <Alert variant="error" title="Room not found">
          Unable to load trade details for this room.
        </Alert>
        <div className="mt-6">
          <EmptyState
            title="Details unavailable"
            description="The room may have been removed or the link is invalid."
            actionLabel="Close tab"
            onAction={() => window.close()}
          />
        </div>
      </PageShell>
    );
  }

  const trade = room.trade || {};

  return (
    <PageShell
      title="Deal Watch"
      description={trade.title ? `Submitted form for: ${trade.title}` : 'Trade submission details'}
      maxWidth="lg"
      showFooter={false}
    >
      <div className="space-y-4 sm:space-y-6 animate-slide-up">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              try {
                window.open(`/rooms/${room.id}`, '_blank');
              } catch {
                router.push(`/rooms/${room.id}`);
              }
            }}
          >
            Open Chat Room
          </Button>
        </div>

        {trade.status && (
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <CardTitle className="!mb-0">Trade Progress</CardTitle>
                <CardDescription className="!mt-1">Current status in the escrow workflow.</CardDescription>
              </div>
              <StatusBadge status={trade.status} />
            </div>
            <TradeProgress status={trade.status} />
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Trade Details</CardTitle>
            <CardDescription>Information submitted when the trade was created.</CardDescription>
          </CardHeader>
          <dl>
            <DetailRow label="Title">{trade.title || '—'}</DetailRow>
            <DetailRow label="Description">
              {trade.description ? (
                <p className="whitespace-pre-wrap leading-relaxed">{trade.description}</p>
              ) : (
                '—'
              )}
            </DetailRow>
            <DetailRow label="Platform">{trade.platform || '—'}</DetailRow>
            <DetailRow label="Value">
              {trade.value != null && trade.value !== '' ? String(trade.value) : '—'}
            </DetailRow>
          </dl>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>Attachments uploaded with the trade submission.</CardDescription>
          </CardHeader>
          {trade.files?.length ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trade.files.map((f) => {
                const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(f.filename || f.url);
                return (
                  <li key={f.id}>
                    <a
                      href={f.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/4 p-3 hover:border-accent/30 hover:bg-white/6 transition-colors group"
                    >
                      {isImage ? (
                        <img
                          src={f.url}
                          alt={f.filename}
                          className="h-14 w-14 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white/8 text-lg">
                          📄
                        </div>
                      )}
                      <span className="text-sm text-accent group-hover:underline truncate">
                        {f.filename}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 py-2">No files uploaded.</p>
          )}
        </Card>
      </div>
    </PageShell>
  );
}
