import { useRouter } from 'next/router';
import { useEffect, useState, useRef, useCallback } from 'react';
import PageShell from '../../components/layout/PageShell';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Alert,
  EmptyState,
  Skeleton,
  Input,
} from '../../components/ui';
import TradeProgress from '../../components/trade/TradeProgress';
import StatusBadge from '../../components/trade/StatusBadge';
import { cn } from '../../lib/cn';

type User = {
  id: string;
  username?: string;
  email?: string;
  role?: string;
};

type Attachment = {
  id: string;
  url: string;
  filename: string;
};

type Message = {
  id: string;
  body: string;
  createdAt: string;
  sender?: User;
  attachments?: Attachment[];
};

type Room = {
  id: string;
  createdAt: string;
  trade?: {
    id: string;
    title?: string;
    status: string;
    middlemanId?: string | null;
  };
  members?: { user: User }[];
  messages: Message[];
};

function getDisplayName(user?: User | null) {
  return user?.username || user?.email || 'Unknown';
}

function getInitial(user?: User | null) {
  const name = getDisplayName(user);
  return name.charAt(0).toUpperCase();
}

function formatMessageTime(date: string) {
  return new Date(date).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isOwnMessage(message: Message, user: User | null) {
  if (!user || !message.sender) return false;
  return message.sender.id === user.id;
}

function RoomSkeleton() {
  return (
    <div className="space-y-6 animate-slide-up">
      <Card>
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-28 rounded-xl" />
          </div>
        </div>
      </Card>
      <Card>
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-16 w-full rounded-xl" />
      </Card>
      <Card padding="lg">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn('flex gap-3', i % 2 === 1 && 'flex-row-reverse')}>
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className={cn('space-y-2 flex-1', i % 2 === 1 && 'items-end flex flex-col')}>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-14 w-2/3 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MessageBubble({ message, user }: { message: Message; user: User | null }) {
  const own = isOwnMessage(message, user);

  return (
    <div className={cn('flex gap-2.5 sm:gap-3', own ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={cn(
          'flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold',
          own
            ? 'bg-accent/20 text-accent border border-accent/30'
            : 'bg-white/10 text-slate-200 border border-white/10'
        )}
        aria-hidden
      >
        {getInitial(message.sender)}
      </div>
      <div className={cn('flex flex-col max-w-[85%] sm:max-w-[75%]', own ? 'items-end' : 'items-start')}>
        <div className={cn('flex items-center gap-2 mb-1', own && 'flex-row-reverse')}>
          <span className="text-xs font-medium text-slate-300">
            {own ? 'You' : getDisplayName(message.sender)}
          </span>
          <time className="text-[10px] sm:text-xs text-slate-500" dateTime={message.createdAt}>
            {formatMessageTime(message.createdAt)}
          </time>
        </div>
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words',
            own
              ? 'bg-accent/15 border border-accent/25 text-accent-foreground rounded-tr-sm'
              : 'bg-white/6 border border-white/8 text-slate-100 rounded-tl-sm'
          )}
        >
          {message.body || (
            <span className="text-slate-400 italic">Sent an attachment</span>
          )}
        </div>
        {message.attachments && message.attachments.length > 0 && (
          <div className={cn('mt-2 flex flex-wrap gap-2', own && 'justify-end')}>
            {message.attachments.map((f) => (
              <a
                key={f.id}
                href={f.url}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-xl border border-white/10 hover:border-accent/30 transition-colors"
              >
                <img
                  src={f.url}
                  alt={f.filename}
                  className="w-24 h-24 sm:w-28 sm:h-28 object-cover group-hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MessageList({
  messages,
  user,
}: {
  messages: Message[];
  user: User | null;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <EmptyState
        icon="💬"
        title="No messages yet"
        description="Start the conversation. Messages and image attachments will appear here."
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} user={user} />
      ))}
      <div ref={bottomRef} aria-hidden />
    </div>
  );
}

function AdminToolbar({ room, router }: { room: Room; router: ReturnType<typeof useRouter> }) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function runAction(key: string, fn: () => Promise<void>) {
    setActionLoading(key);
    try {
      await fn();
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Actions</CardTitle>
        <CardDescription>Manage this trade room and its participants.</CardDescription>
      </CardHeader>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <Button
          size="sm"
          loading={actionLoading === 'join'}
          onClick={() =>
            runAction('join', async () => {
              try {
                const r = await fetch(`/api/rooms/${room.id}/join`, {
                  method: 'POST',
                  credentials: 'same-origin',
                });
                if (r.ok) {
                  alert('You have joined the room');
                  window.location.reload();
                } else {
                  const j = await r.json().catch(() => ({}));
                  alert('Failed to join: ' + (j.error || r.statusText));
                }
              } catch {
                alert('Network error');
              }
            })
          }
        >
          Join Room
        </Button>

        {room.trade &&
          room.trade.status === 'WAITING_FOR_MIDDLEMEN' &&
          !room.trade.middlemanId && (
            <Button
              size="sm"
              variant="secondary"
              loading={actionLoading === 'middleman'}
              onClick={() =>
                runAction('middleman', async () => {
                  if (!confirm('Accept escrow assignment for this trade?')) return;
                  try {
                    const resp = await fetch('/api/trades/accept-middleman', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ tradeId: room.trade!.id }),
                    });
                    if (resp.ok) {
                      alert('You have accepted the escrow assignment for this trade');
                      window.location.reload();
                    } else {
                      const j = await resp.json();
                      alert('Failed: ' + (j.error || resp.statusText));
                    }
                  } catch {
                    alert('Request failed');
                  }
                })
              }
            >
              Accept Escrow Assignment
            </Button>
          )}

        <Button
          size="sm"
          variant="danger"
          loading={actionLoading === 'delete'}
          onClick={() =>
            runAction('delete', async () => {
              if (!confirm('Delete the message room for this trade? This cannot be undone.')) return;
              try {
                const tradeId = room.trade?.id;
                let resp;
                if (tradeId) {
                  resp = await fetch(`/api/admin/trades/${tradeId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'deleteRoom' }),
                  });
                } else {
                  resp = await fetch(`/api/admin/rooms/${room.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'deleteRoom' }),
                  });
                }
                if (resp.ok) {
                  alert('Room deleted');
                  router.push('/dashboard');
                } else {
                  const j = await resp.json();
                  alert('Delete failed: ' + (j.error || resp.statusText));
                }
              } catch {
                alert('Delete failed');
              }
            })
          }
        >
          Delete Room
        </Button>

        <Button
          size="sm"
          variant="secondary"
          className="!bg-emerald-600/90 hover:!bg-emerald-600"
          loading={actionLoading === 'complete'}
          onClick={() =>
            runAction('complete', async () => {
              if (
                !confirm(
                  'Mark this trade as complete? This will prompt participants to leave reviews.'
                )
              )
                return;
              try {
                const tradeId = room.trade?.id;
                const resp = await fetch(`/api/admin/trades/${tradeId}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: 'complete' }),
                });
                if (resp.ok) {
                  alert('Trade marked complete');
                  const j = await resp.json();
                  if (j.roomId) window.open(`/rooms/${j.roomId}`, '_blank');
                } else {
                  const j = await resp.json();
                  alert('Failed: ' + (j.error || resp.statusText));
                }
              } catch {
                alert('Failed');
              }
            })
          }
        >
          Mark Complete
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            try {
              window.open(`/rooms/${room.id}/watch`, '_blank');
            } catch {
              alert('Failed to open watch tab');
            }
          }}
        >
          Watch Deal Details
        </Button>
      </div>
    </Card>
  );
}

function MessageInput({ roomId }: { roomId: string }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      if (!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items || []);
      const imageItems = items.filter((i) => i.type.startsWith('image/'));
      if (imageItems.length) {
        e.preventDefault();
        imageItems.forEach((it) => {
          const f = it.getAsFile();
          if (f) setFiles((prev) => [...prev, f]);
        });
      }
    }
    window.addEventListener('paste', onPaste as EventListener);
    return () => window.removeEventListener('paste', onPaste as EventListener);
  }, []);

  async function send() {
    if (!text.trim() && files.length === 0) return;
    setSending(true);
    try {
      const attachments: { filename: string; data: string; mime: string }[] = [];
      for (const f of files) {
        const data = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => {
            const res = fr.result as string;
            const b = res.split(',')[1];
            resolve(b);
          };
          fr.onerror = () => reject(fr.error);
          fr.readAsDataURL(f);
        });
        attachments.push({ filename: f.name, data, mime: f.type });
      }

      const r = await fetch(`/api/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text, attachments }),
      });
      if (r.ok) {
        setText('');
        window.location.reload();
      }
    } catch {
      /* preserve original silent catch */
    }
    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="border-t border-white/8 pt-4 mt-4">
      {files.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 pr-3"
            >
              <img
                src={URL.createObjectURL(f)}
                alt={f.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
              <span className="text-xs text-slate-300 max-w-[120px] truncate">{f.name}</span>
              <button
                type="button"
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                className="ml-1 rounded-lg px-2 py-0.5 text-xs text-red-300 hover:bg-red-500/10 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message…"
            aria-label="Message"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={(el) => {
              fileRef.current = el;
            }}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const fl = e.target.files;
              if (fl) setFiles((prev) => [...prev, ...Array.from(fl)]);
              e.currentTarget.value = '';
            }}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileRef.current?.click()}
          >
            Attach
          </Button>
          <Button type="button" size="sm" loading={sending} onClick={send}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RoomPage() {
  const router = useRouter();
  const { id } = router.query;
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [, setWatching] = useState(false);

  const fetchRoom = useCallback(async (roomId: string, mounted: { current: boolean }) => {
    const r = await fetch(`/api/rooms/${roomId}`);
    if (!mounted.current) return;
    if (!r.ok) {
      setLoading(false);
      return;
    }
    const j = await r.json();
    setRoom(j.room);
    try {
      const v = localStorage.getItem('watch_room_' + j.room.id);
      setWatching(v === '1');
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    const mounted = { current: true };
    setLoading(true);
    fetchRoom(id, mounted);
    return () => {
      mounted.current = false;
    };
  }, [id, fetchRoom]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return;
        setUser(j.user ?? null);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <PageShell title="Trade Room" maxWidth="lg">
        <RoomSkeleton />
      </PageShell>
    );
  }

  if (!room) {
    return (
      <PageShell title="Trade Room" maxWidth="lg">
        <Alert variant="error" title="Room not found">
          This trade room does not exist or you do not have access to it.
        </Alert>
        <div className="mt-6">
          <EmptyState
            title="Room unavailable"
            description="The room may have been deleted or the link is incorrect."
            actionLabel="Go to Dashboard"
            actionHref="/dashboard"
          />
        </div>
      </PageShell>
    );
  }

  const tradeTitle = room.trade?.title ?? 'Untitled Trade';
  const participants =
    room.members?.map((m) => getDisplayName(m.user)).join(', ') || '—';

  return (
    <PageShell
      title={tradeTitle}
      description={`Trade room · ${participants}`}
      maxWidth="lg"
    >
      <div className="space-y-4 sm:space-y-6 animate-slide-up">
        {user && user.role === 'ADMIN' && <AdminToolbar room={room} router={router} />}

        {room.trade && (
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <CardTitle className="!mb-0">Trade Status</CardTitle>
                <CardDescription className="!mt-1">
                  Track progress through the escrow workflow.
                </CardDescription>
              </div>
              <StatusBadge status={room.trade.status} />
            </div>
            <TradeProgress status={room.trade.status} />
          </Card>
        )}

        <Card padding="lg" className="flex flex-col">
          <CardHeader className="!mb-0 pb-4 border-b border-white/8">
            <CardTitle>Messages</CardTitle>
            <CardDescription>
              Chat with trade participants. Paste or attach images.
            </CardDescription>
          </CardHeader>

          <div
            id="messages"
            className="flex-1 overflow-y-auto py-4 sm:py-5 max-h-[50vh] sm:max-h-[55vh] min-h-[200px] scrollbar-thin"
          >
            <MessageList messages={room.messages} user={user} />
          </div>

          <MessageInput roomId={room.id} />
        </Card>
      </div>
    </PageShell>
  );
}
