import { useEffect, useState } from 'react';
import { Bell, User } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';

type Notification = {
  id: string;
  type: string;
  payload?: string;
  read?: boolean;
  createdAt: string;
};

function parsePayload(raw?: string): Record<string, string> {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return {};
  }
}

function typeBadgeVariant(type: string): 'info' | 'success' | 'warning' | 'danger' | 'default' | 'purple' {
  if (type === 'trade_completed') return 'success';
  if (type === 'middleman_needed') return 'warning';
  if (type === 'contact_message') return 'purple';
  if (type === 'message') return 'info';
  if (type === 'trade_created') return 'default';
  return 'default';
}

function typeLabel(type: string): string {
  const labels: Record<string, string> = {
    contact_message: 'Contact',
    message: 'Message',
    trade_created: 'Trade',
    middleman_needed: 'Assignment',
    trade_completed: 'Completed',
  };
  return labels[type] || type.replace(/_/g, ' ');
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchNotifs() {
    try {
      const r = await fetch('/api/notifications', { credentials: 'same-origin' });
      if (!r.ok) return;
      const j = await r.json();
      setNotifications(j.notifications || []);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    fetchNotifs();
  }, []);

  async function markRead(id: string) {
    const prev = notifications;
    setNotifications(prev.filter((n) => n.id !== id));
    try {
      const r = await fetch('/api/notifications', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!r.ok) {
        setNotifications(prev);
        const j = await r.json().catch(() => ({}));
        alert('Error: ' + (j.error || r.statusText || 'Unable to dismiss notification'));
      }
    } catch {
      setNotifications(prev);
      alert('Network error marking read');
    }
  }

  async function handleCreateChat(id: string) {
    setLoading(true);
    try {
      const r = await fetch('/api/notifications/create-chat', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.roomId) {
        window.location.href = `/rooms/${j.roomId}`;
        return;
      }
      alert('Error: ' + (j.error || r.statusText || 'Unknown error'));
    } catch {
      alert('Network error');
    }
    setLoading(false);
  }

  return (
    <PageShell
      title="Notifications"
      description="Stay on top of trades, messages, and requests."
      maxWidth="lg"
    >
      {notifications.length === 0 && (
        <EmptyState
          icon={<Bell className="h-6 w-6" strokeWidth={2} aria-hidden />}
          title="You're all caught up"
          description="No new notifications right now. When something needs your attention — a trade update, message, or assignment — it will appear here."
          actionLabel="View dashboard"
          actionHref="/dashboard"
        />
      )}

      <div className="space-y-4">
        {notifications.map((n) => {
          const payload = parsePayload(n.payload);
          const when = new Date(n.createdAt).toLocaleString();

          if (n.type === 'contact_message') {
            return (
              <NotificationCard key={n.id} unread={!n.read} type={n.type}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">New contact request</h3>
                      <Badge variant={typeBadgeVariant(n.type)}>{typeLabel(n.type)}</Badge>
                    </div>
                    <p className="text-sm text-slate-400">From: {payload.email || 'Unknown'}</p>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                      {(payload.message || '').slice(0, 300)}
                    </p>
                    <p className="text-xs text-slate-500 mt-3">Received: {when}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" disabled={loading} onClick={() => markRead(n.id)}>
                      Ignore
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      loading={loading}
                      disabled={loading}
                      onClick={() => handleCreateChat(n.id)}
                    >
                      Create Chat
                    </Button>
                  </div>
                </div>
              </NotificationCard>
            );
          }

          if (n.type === 'message') {
            return (
              <NotificationCard key={n.id} unread={!n.read} type={n.type}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">New message</h3>
                      <Badge variant={typeBadgeVariant(n.type)}>{typeLabel(n.type)}</Badge>
                    </div>
                    <p className="text-sm text-slate-400">
                      {payload.roomId
                        ? `Conversation: ${payload.roomId}`
                        : 'You have a new message.'}
                    </p>
                    <p className="text-xs text-slate-500 mt-3">Received: {when}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" disabled={loading} onClick={() => markRead(n.id)}>
                      Dismiss
                    </Button>
                    {payload.roomId && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={loading}
                        onClick={() => {
                          window.location.href = `/rooms/${payload.roomId}`;
                        }}
                      >
                        Open
                      </Button>
                    )}
                  </div>
                </div>
              </NotificationCard>
            );
          }

          if (n.type === 'trade_created') {
            const tradeId = payload.tradeId || payload.tradeid || payload.tradeID;
            const roomId = payload.roomId || payload.roomid;
            return (
              <NotificationCard key={n.id} unread={!n.read} type={n.type}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">New trade created</h3>
                      <Badge variant={typeBadgeVariant(n.type)}>{typeLabel(n.type)}</Badge>
                    </div>
                    <p className="text-sm text-slate-400">
                      {tradeId ? `Trade ID: ${tradeId}` : 'A new trade was created.'}
                    </p>
                    <p className="text-xs text-slate-500 mt-3">Received: {when}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" disabled={loading} onClick={() => markRead(n.id)}>
                      Ignore
                    </Button>
                    {roomId && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={loading}
                        onClick={() => {
                          window.location.href = `/rooms/${roomId}`;
                        }}
                      >
                        Open Chat
                      </Button>
                    )}
                    {tradeId && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        onClick={() => {
                          window.location.href = `/trades/${tradeId}`;
                        }}
                      >
                        View Trade
                      </Button>
                    )}
                  </div>
                </div>
              </NotificationCard>
            );
          }

          if (n.type === 'middleman_needed') {
            return (
              <MiddlemanNotification
                key={n.id}
                n={n}
                payload={payload}
                when={when}
                markRead={markRead}
              />
            );
          }

          if (n.type === 'trade_completed') {
            const tradeId = payload.tradeId || payload.tradeid || payload.tradeID;
            return (
              <NotificationCard key={n.id} unread={!n.read} type={n.type}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-white">Trade completed</h3>
                      <Badge variant={typeBadgeVariant(n.type)}>{typeLabel(n.type)}</Badge>
                    </div>
                    <p className="text-sm text-slate-400">
                      {tradeId ? `Trade ID: ${tradeId}` : 'A trade was completed.'}
                    </p>
                    <p className="text-xs text-slate-500 mt-3">Received: {when}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button variant="ghost" size="sm" disabled={loading} onClick={() => markRead(n.id)}>
                      Dismiss
                    </Button>
                    {tradeId && (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={loading}
                        onClick={() => {
                          window.location.href = `/trades/${tradeId}/review`;
                        }}
                      >
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              </NotificationCard>
            );
          }

          return (
            <NotificationCard key={n.id} unread={!n.read} type={n.type}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-white">
                      {n.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </h3>
                    <Badge variant="default">{typeLabel(n.type)}</Badge>
                  </div>
                  <p className="text-sm text-slate-400">
                    {typeof n.payload === 'string'
                      ? n.payload.slice(0, 200)
                      : JSON.stringify(payload).slice(0, 200)}
                  </p>
                  <p className="text-xs text-slate-500 mt-3">Received: {when}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Button variant="ghost" size="sm" disabled={loading} onClick={() => markRead(n.id)}>
                    Dismiss
                  </Button>
                </div>
              </div>
            </NotificationCard>
          );
        })}
      </div>
    </PageShell>
  );
}

function NotificationCard({
  children,
  unread,
  type,
}: {
  children: React.ReactNode;
  unread?: boolean;
  type: string;
}) {
  return (
    <Card
      padding="md"
      className={unread ? 'border-primary/25 bg-primary/5' : undefined}
      data-notification-type={type}
    >
      {children}
    </Card>
  );
}

function MiddlemanNotification({
  n,
  payload,
  when,
  markRead,
}: {
  n: Notification;
  payload: Record<string, string>;
  when: string;
  markRead: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [trade, setTrade] = useState<{ middlemanId?: string; middleman?: { username?: string } } | null>(
    null
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const id = payload.tradeId || payload.tradeid;
        if (!id) return;
        const r = await fetch(`/api/admin/trades/${id}`, { credentials: 'same-origin' });
        if (!mounted) return;
        if (r.ok) {
          const j = await r.json();
          setTrade(j.trade);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      mounted = false;
    };
  }, [payload]);

  useEffect(() => {
    if (trade && trade.middlemanId) {
      try {
        markRead(n.id);
      } catch {
        /* ignore */
      }
    }
  }, [trade, n.id, markRead]);

  return (
    <NotificationCard unread={!n.read} type={n.type}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-white">Trade awaiting assignment</h3>
            <Badge variant="warning">Assignment</Badge>
          </div>
          <p className="text-sm text-slate-400">
            {payload.tradeId
              ? `Trade #${payload.tradeId} is ready for TrustedMM escrow agent assignment.`
              : 'A trade request is awaiting escrow agent assignment.'}
          </p>
          <p className="text-xs text-slate-500 mt-3">Received: {when}</p>
          {trade && trade.middlemanId && (
            <Alert variant="info" className="mt-3">
              Already assigned: {trade.middleman?.username || trade.middlemanId}
            </Alert>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" disabled={loading} onClick={() => markRead(n.id)}>
            Dismiss
          </Button>
          {payload.roomId && (
            <Button
              variant="primary"
              size="sm"
              disabled={loading}
              onClick={() => {
                window.location.href = `/rooms/${payload.roomId}`;
              }}
            >
              Open Chat
            </Button>
          )}
          {payload.tradeId && (
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => {
                window.location.href = `/trades/${payload.tradeId}`;
              }}
            >
              View Trade
            </Button>
          )}
          {!trade && <span className="text-sm text-slate-500 px-2">Checking trade…</span>}
          {trade && !trade.middlemanId && (
            <Button
              variant="secondary"
              size="sm"
              loading={loading}
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                try {
                  const r = await fetch('/api/trades/accept-middleman', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tradeId: payload.tradeId }),
                  });
                  const j = await r.json().catch(() => ({}));
                  if (r.ok) {
                    alert('Escrow assignment accepted for this trade');
                    markRead(n.id);
                    window.location.href = `/trades/${payload.tradeId}`;
                    return;
                  }
                  alert(
                    'Error: ' +
                      (j.error || r.statusText || 'Unable to accept') +
                      (j.trade ? '\n\n' + JSON.stringify(j.trade, null, 2) : '')
                  );
                } catch {
                  alert('Network error');
                }
                setLoading(false);
              }}
            >
              Accept Assignment
            </Button>
          )}
        </div>
      </div>
    </NotificationCard>
  );
}
