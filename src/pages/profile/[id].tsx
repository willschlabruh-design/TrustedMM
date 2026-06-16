import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
  name?: string | null;
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
  verified?: boolean;
  role?: string;
  createdAt?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;

    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/middlemen`, { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json();
          const match = (data.middlemen ?? []).find((m: ProfileUser) => m.id === id);
          if (match) {
            setProfile({
              ...match,
              username: match.name ?? match.username,
            });
            return;
          }
        }
        setNotFound(true);
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
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PageShell>
    );
  }

  if (notFound || !profile) {
    return (
      <PageShell maxWidth="lg">
        <EmptyState
          icon="👤"
          title="Profile not found"
          description="This user doesn't exist or their profile isn't available on the marketplace."
          actionLabel="Find Middlemen"
          actionHref="/find-middleman"
        />
      </PageShell>
    );
  }

  const displayName = profile.username ?? profile.name ?? 'User';
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '—';
  const rating = profile.rating != null ? profile.rating.toFixed(1) : '—';

  return (
    <PageShell maxWidth="lg">
      {/* Hero */}
      <Card className="mb-6 overflow-hidden relative" padding="lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/5 pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/30 to-primary/20 border border-white/10 text-3xl font-bold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">{displayName}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {profile.verified ? (
                <Badge variant="success">Verified Middleman</Badge>
              ) : (
                <Badge variant="warning">Unverified</Badge>
              )}
              {profile.role === 'ADMIN' && <Badge variant="purple">Platform Admin</Badge>}
              <Badge variant="info">★ {rating} rating</Badge>
            </div>
          </div>
          <Link href="/create-trade" className="shrink-0">
            <Button>Request Trade</Button>
          </Link>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Account info */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Account info</CardTitle>
            <CardDescription>Public profile details.</CardDescription>
          </CardHeader>
          <dl className="space-y-4 text-sm">
            <ProfileRow label="Display name" value={displayName} />
            <ProfileRow label="Member since" value={memberSince} />
            <ProfileRow label="Role" value={profile.role ?? 'Middleman'} />
            <ProfileRow label="User ID" value={profile.id.slice(0, 12) + '…'} />
          </dl>
        </Card>

        {/* Verification */}
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Verification</CardTitle>
            <CardDescription>Trust and identity status.</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <div className="rounded-xl border border-white/8 bg-white/3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">Identity verification</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {profile.verified
                      ? 'This middleman has completed platform verification.'
                      : 'Verification has not been completed.'}
                  </p>
                </div>
                <Badge variant={profile.verified ? 'success' : 'warning'}>
                  {profile.verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            </div>
            <div className="rounded-xl border border-white/8 bg-white/3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">Platform rating</p>
                  <p className="text-xs text-slate-400 mt-0.5">Based on completed trades and reviews.</p>
                </div>
                <span className="text-lg font-bold text-accent">{rating}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Reviews placeholder */}
      <Card className="mt-6" padding="lg">
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
          <CardDescription>Feedback from past trade participants.</CardDescription>
        </CardHeader>
        <div className="rounded-xl border border-dashed border-white/10 bg-white/2 py-10 text-center">
          <p className="text-4xl mb-3" aria-hidden>
            ⭐
          </p>
          <p className="text-sm font-medium text-white">No reviews yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Reviews from completed trades will appear here once the review system is fully connected.
          </p>
        </div>
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
