import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { User } from 'lucide-react';
import PageShell from '../../components/layout/PageShell';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  EmptyState,
  SkeletonCard,
} from '../../components/ui';

type ProfileUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  rating?: number;
  verified?: boolean;
  role?: string;
  createdAt?: string;
};

type ProfileReview = {
  id: string;
  rating: number;
  text?: string | null;
  tradeTitle?: string;
  authorUsername?: string;
  createdAt: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [reviews, setReviews] = useState<ProfileReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/users/${id}`, { credentials: 'same-origin' });
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setProfile(data.profile);
        setReviews(data.reviews ?? []);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <PageShell maxWidth="lg">
        <SkeletonCard />
      </PageShell>
    );
  }

  if (notFound || !profile) {
    return (
      <PageShell maxWidth="lg">
        <EmptyState
          icon={<User className="h-6 w-6" strokeWidth={2} aria-hidden />}
          title="Profile not available"
          description="This profile is private or does not exist."
          actionLabel="Request a Trade"
          actionHref="/create-trade"
        />
      </PageShell>
    );
  }

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '—';
  const rating = profile.rating != null ? profile.rating.toFixed(1) : '—';

  return (
    <PageShell maxWidth="lg">
      <Card className="mb-6 overflow-hidden relative" padding="lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-primary/20 border border-white/10 text-3xl font-bold text-white">
            {profile.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{profile.displayName}</h1>
            <p className="text-sm text-slate-400 mt-1">@{profile.username}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.verified ? (
                <Badge variant="success">Verified</Badge>
              ) : (
                <Badge variant="warning">Unverified</Badge>
              )}
              {profile.role === 'ADMIN' && <Badge variant="purple">TrustedMM Staff</Badge>}
              <Badge variant="info">★ {rating}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Account info</CardTitle>
          </CardHeader>
          <dl className="space-y-4 text-sm">
            <ProfileRow label="Username" value={profile.username} />
            <ProfileRow label="Member since" value={memberSince} />
          </dl>
        </Card>

        <Card padding="lg">
          <CardHeader>
            <CardTitle>Verification</CardTitle>
            <CardDescription>Platform trust status for this participant.</CardDescription>
          </CardHeader>
          <Badge variant={profile.verified ? 'success' : 'warning'}>
            {profile.verified ? 'Identity verified' : 'Verification pending'}
          </Badge>
        </Card>
      </div>

      <Card className="mt-6" padding="lg">
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
          <CardDescription>Feedback from completed trades.</CardDescription>
        </CardHeader>
        {reviews.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No reviews yet.</p>
        ) : (
          <ul className="space-y-4">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-xl border border-white/8 bg-white/3 p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-sm font-medium text-white">
                    {review.authorUsername ?? 'User'}
                  </span>
                  <span className="text-accent text-sm">{review.rating}★</span>
                </div>
                {review.tradeTitle && (
                  <p className="text-xs text-slate-500 mb-1">Trade: {review.tradeTitle}</p>
                )}
                {review.text && <p className="text-sm text-slate-300">{review.text}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </PageShell>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-white/5 last:border-0">
      <dt className="text-slate-400 shrink-0">{label}</dt>
      <dd className="text-white font-medium text-right truncate">{value}</dd>
    </div>
  );
}
