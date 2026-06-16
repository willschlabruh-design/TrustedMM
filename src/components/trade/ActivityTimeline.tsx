import { cn } from '../../lib/cn';

export type TimelineEvent = {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type?: 'default' | 'success' | 'warning' | 'info';
};

const dotColors = {
  default: 'bg-slate-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  info: 'bg-blue-400',
};

export default function ActivityTimeline({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return null;
  }

  return (
    <ol className="relative space-y-0">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10" aria-hidden />
      {events.map((event, index) => (
        <li key={event.id} className={cn('relative pl-8 pb-6', index === events.length - 1 && 'pb-0')}>
          <span
            className={cn(
              'absolute left-0 top-1.5 h-[10px] w-[10px] rounded-full ring-4 ring-navy-900',
              dotColors[event.type || 'default']
            )}
            aria-hidden
          />
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
            <div>
              <p className="text-sm font-medium text-white">{event.title}</p>
              {event.description && (
                <p className="text-xs text-slate-400 mt-0.5">{event.description}</p>
              )}
            </div>
            <time className="text-xs text-slate-500 whitespace-nowrap">{event.timestamp}</time>
          </div>
        </li>
      ))}
    </ol>
  );
}
