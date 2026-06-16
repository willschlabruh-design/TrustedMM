import { useRouter } from 'next/router';
import { useState } from 'react';
import PageShell from '../../../components/layout/PageShell';
import { Button, Card, CardHeader, CardTitle, CardDescription, Alert } from '../../../components/ui';

export default function TradeReview() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!id) return;
    setStatus('loading');
    setError(null);

    const r = await fetch(`/api/trades/${id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ rating, text }),
    });
    const j = await r.json();

    if (r.ok) {
      setStatus('success');
      setTimeout(() => router.push('/reviews'), 1500);
    } else {
      setStatus('error');
      setError(j.error || 'Failed to submit review');
    }
  }

  return (
    <PageShell
      title="Leave a review"
      description="Share your experience to help build trust on TrustedMM."
      maxWidth="md"
    >
      {status === 'success' ? (
        <Card padding="lg" className="text-center animate-fade-in">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-xl font-semibold text-white">Review submitted</h2>
          <p className="mt-2 text-sm text-slate-400">Thank you for your feedback. Redirecting…</p>
        </Card>
      ) : (
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Rate this trade</CardTitle>
            <CardDescription>
              Your review helps other users choose trusted middlemen and trade safely.
            </CardDescription>
          </CardHeader>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-200 mb-3">Rating</p>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`min-w-[3rem] px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      rating === n
                        ? 'bg-accent text-navy-950 scale-105'
                        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
                    }`}
                    aria-label={`${n} stars`}
                  >
                    {n}★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="review-text" className="block text-sm font-medium text-slate-200 mb-2">
                Review
              </label>
              <textarea
                id="review-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="app-input min-h-[120px] resize-y"
                rows={5}
                placeholder="Describe your experience with this trade…"
              />
            </div>

            {error && <Alert variant="error">{error}</Alert>}

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={submit} loading={status === 'loading'}>
                Submit Review
              </Button>
              <a href="/dashboard" className="text-sm text-slate-400 hover:text-white">
                Cancel
              </a>
            </div>
          </div>
        </Card>
      )}
    </PageShell>
  );
}
