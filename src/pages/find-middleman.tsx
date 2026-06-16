import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import PageShell from '../components/layout/PageShell';
import {
  Button,
  Card,
  Input,
  Badge,
  EmptyState,
  SkeletonCard,
} from '../components/ui';
import { cn } from '../lib/cn';

type Middleman = {
  id: string;
  name?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
  createdAt?: string;
  verified?: boolean;
};

type FilterKey = 'verified' | 'rating' | 'available';

const FILTER_CHIPS: { key: FilterKey; label: string; hint: string }[] = [
  { key: 'verified', label: 'Verified', hint: 'Show verified middlemen only' },
  { key: 'rating', label: 'Top Rated', hint: 'Sort by highest rating' },
  { key: 'available', label: 'Available', hint: 'UI filter — shows active listings' },
];

export default function FindMiddleman() {
  const [list, setList] = useState<Middleman[]>([]);
  const [q, setQ] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Set<FilterKey>>(new Set(['available']));

  const fetchList = useCallback(async (query: string, activeFilters: Set<FilterKey>) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (activeFilters.has('verified')) params.set('verified', 'true');
      if (activeFilters.has('rating')) params.set('sort', 'rating');
      const res = await fetch(`/api/middlemen?${params.toString()}`, { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        let middlemen: Middleman[] = data.middlemen ?? [];
        if (activeFilters.has('available')) {
          middlemen = middlemen.filter((m) => m.verified !== false);
        }
        setList(middlemen);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList(searchQuery, filters);
  }, [fetchList, searchQuery, filters]);

  function toggleFilter(key: FilterKey) {
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(q.trim());
  }

  return (
    <PageShell
      title="Find a Middleman"
      description="Browse verified platform middlemen. Request a trade to get started with escrow protection."
      maxWidth="2xl"
    >
      <Card className="mb-6" padding="md">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              label="Search"
              placeholder="Search by name or email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full sm:w-auto">
              Search
            </Button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {FILTER_CHIPS.map((chip) => {
            const active = filters.has(chip.key);
            return (
              <button
                key={chip.key}
                type="button"
                title={chip.hint}
                onClick={() => toggleFilter(chip.key)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                  active
                    ? 'bg-accent/15 border-accent/30 text-accent'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                )}
              >
                {active && <span aria-hidden>✓</span>}
                {chip.label}
              </button>
            );
          })}
        </div>
      </Card>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No middlemen found"
          description="Try adjusting your search or filters. Verified middlemen with active availability will appear here."
          actionLabel="Clear filters"
          onAction={() => {
            setQ('');
            setSearchQuery('');
            setFilters(new Set());
          }}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((m) => (
            <MiddlemanCard key={m.id} middleman={m} />
          ))}
        </div>
      )}
    </PageShell>
  );
}

function MiddlemanCard({ middleman: m }: { middleman: Middleman }) {
  const displayName = m.name ?? 'Unnamed';
  const rating = m.rating != null ? m.rating.toFixed(1) : '—';

  return (
    <Card hover padding="md" className="flex flex-col h-full">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-purple-500/20 border border-white/10 text-xl font-bold text-white">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white truncate">{displayName}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {m.verified ? (
              <Badge variant="success">Verified</Badge>
            ) : (
              <Badge variant="warning">Unverified</Badge>
            )}
            <Badge variant="info">★ {rating}</Badge>
            <Badge variant="default">Available</Badge>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-white/8 flex gap-2">
        <Link href={`/profile/${m.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            View Profile
          </Button>
        </Link>
        <Link href="/create-trade" className="flex-1">
          <Button size="sm" className="w-full">
            Request Trade
          </Button>
        </Link>
      </div>
    </Card>
  );
}
