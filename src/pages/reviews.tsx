import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Card, { CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/Skeleton';

function useCurrentUser() {
  const [user, setUser] = useState<{ role?: string } | null>(null);
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
  return user;
}

type Review = {
  id: string;
  rating: number;
  text: string;
  author?: { username?: string; name?: string };
  trade?: { title?: string };
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? 'text-accent' : 'text-slate-600'}>
          ★
        </span>
      ))}
      <Badge variant="default" className="ml-2">
        {rating}/5
      </Badge>
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useCurrentUser();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await fetch('/api/reviews');
        if (!mounted) return;
        if (!r.ok) {
          setLoading(false);
          return;
        }
        const j = await r.json();
        setReviews(j.reviews || []);
      } catch {
        /* ignore */
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PageShell
      title="Reviews"
      description="Verified reviews from completed trades."
      maxWidth="xl"
    >
      {loading && (
        <div className="grid md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <EmptyState
          icon={<Star className="h-6 w-6" strokeWidth={2} aria-hidden />}
          title="No reviews yet"
          description="Reviews appear here after trades are completed. Complete a trade to leave or receive feedback."
          actionLabel="Go to dashboard"
          actionHref="/dashboard"
        />
      )}

      {!loading && reviews.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {reviews.map((r) => (
            <Card key={r.id} hover padding="md">
              <CardHeader className="flex flex-row items-start gap-4 mb-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 text-lg font-bold">
                  {(r.author?.username || r.author?.name || 'U')[0]?.toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base">
                    {r.author?.username || r.author?.name || 'User'}
                  </CardTitle>
                  <div className="mt-1">
                    <StarRating rating={r.rating} />
                  </div>
                </div>
              </CardHeader>
              <p className="mt-4 text-slate-300 text-sm leading-relaxed">{r.text}</p>
              <CardDescription className="mt-3">
                For trade: {r.trade?.title ?? '—'}
              </CardDescription>
              {user && user.role === 'ADMIN' && (
                <div className="mt-4 pt-4 border-t border-white/8">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={async () => {
                      if (!confirm('Delete this review? This cannot be undone.')) return;
                      try {
                        const resp = await fetch(`/api/reviews/${r.id}`, { method: 'DELETE' });
                        if (resp.ok) {
                          setReviews((prev) => prev.filter((x) => x.id !== r.id));
                        } else {
                          const j = await resp.json();
                          alert('Failed: ' + (j.error || resp.statusText));
                        }
                      } catch {
                        alert('Failed to delete');
                      }
                    }}
                  >
                    Delete review
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}
