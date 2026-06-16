import { useEffect, useState } from 'react';
import PageShell from '../components/layout/PageShell';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { cn } from '../lib/cn';

type RoomMember = { user: { username: string } };
type RoomMessage = { body: string; createdAt: string };
type Room = {
  id: string;
  createdAt: string;
  trade?: { title?: string };
  members: RoomMember[];
  messages?: RoomMessage[];
};

function getRoomInitial(room: Room): string {
  const title = room.trade?.title?.trim();
  if (title) return title[0].toUpperCase();
  const firstMember = room.members[0]?.user?.username;
  if (firstMember) return firstMember[0].toUpperCase();
  return 'T';
}

function getRoomTitle(room: Room): string {
  return room.trade?.title || 'Trade conversation';
}

function getLastMessage(room: Room): { preview: string; date: Date | null } {
  const msg = room.messages?.[0];
  if (msg?.body) {
    return {
      preview: msg.body.length > 60 ? `${msg.body.slice(0, 60)}…` : msg.body,
      date: new Date(msg.createdAt),
    };
  }
  return { preview: 'No messages yet', date: new Date(room.createdAt) };
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function avatarColor(id: string): string {
  const colors = [
    'from-violet-500/30 to-purple-600/30 border-violet-400/30',
    'from-blue-500/30 to-cyan-600/30 border-blue-400/30',
    'from-emerald-500/30 to-teal-600/30 border-emerald-400/30',
    'from-amber-500/30 to-orange-600/30 border-amber-400/30',
    'from-rose-500/30 to-pink-600/30 border-rose-400/30',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Messages() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/rooms');
      if (!r.ok) {
        setLoading(false);
        return;
      }
      const j = await r.json();
      const list: Room[] = j.rooms || [];
      list.sort((a, b) => {
        const aDate = a.messages?.[0]?.createdAt
          ? new Date(a.messages[0].createdAt).getTime()
          : new Date(a.createdAt).getTime();
        const bDate = b.messages?.[0]?.createdAt
          ? new Date(b.messages[0].createdAt).getTime()
          : new Date(b.createdAt).getTime();
        return bDate - aDate;
      });
      setRooms(list);
      setLoading(false);
    })();
  }, []);

  return (
    <PageShell
      title="Messages"
      description="Your trade conversations in one place."
      maxWidth="full"
      className="pb-8"
    >
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 lg:h-[calc(100vh-14rem)] min-h-[32rem]">
        {/* Sidebar — conversation list */}
        <aside className="lg:w-80 xl:w-96 shrink-0 flex flex-col">
          <Card padding="sm" className="flex flex-col flex-1 overflow-hidden lg:rounded-r-none lg:border-r-0">
            <div className="px-2 py-3 border-b border-white/8">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Conversations
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl" />
                  ))}
                </div>
              )}
              {!loading && rooms.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-sm text-slate-400">No conversations yet</p>
                </div>
              )}
              {!loading &&
                rooms.map((room) => {
                  const { preview, date } = getLastMessage(room);
                  return (
                    <a
                      key={room.id}
                      href={`/rooms/${room.id}`}
                      className={cn(
                        'flex items-start gap-3 px-3 py-3 border-b border-white/5',
                        'transition-colors hover:bg-white/5 active:bg-white/8'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                          'bg-gradient-to-br border text-sm font-bold text-white',
                          avatarColor(room.id)
                        )}
                      >
                        {getRoomInitial(room)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-white">
                            {getRoomTitle(room)}
                          </span>
                          {date && (
                            <span className="shrink-0 text-[11px] text-slate-500">
                              {formatRelativeTime(date)}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-slate-400">{preview}</p>
                        <p className="mt-1 truncate text-[11px] text-slate-500">
                          {room.members.map((m) => m.user.username).join(', ')}
                        </p>
                      </div>
                    </a>
                  );
                })}
            </div>
          </Card>
        </aside>

        {/* Main — empty state (desktop) */}
        <Card
          padding="lg"
          className="hidden lg:flex flex-1 items-center justify-center lg:rounded-l-none border-l-0"
        >
          <EmptyState
            icon="💬"
            title="Select a conversation"
            description="Choose a trade chat from the sidebar to view messages, or start a new trade to begin a conversation."
            actionLabel="Request a Trade"
            actionHref="/create-trade"
          />
        </Card>

        {/* Mobile hint when list has items */}
        {!loading && rooms.length > 0 && (
          <p className="lg:hidden text-center text-sm text-slate-400 pb-4">
            Tap a conversation above to open it.
          </p>
        )}
      </div>
    </PageShell>
  );
}
