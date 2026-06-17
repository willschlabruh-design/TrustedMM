import { useEffect } from 'react';
import { useRouter } from 'next/router';
import PageShell from '../components/layout/PageShell';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '../components/ui';

export default function FindMiddlemanRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/create-trade');
  }, [router]);

  return (
    <PageShell
      title="Request a Trade"
      description="TrustedMM assigns platform oversight to your trade — you don't need to browse or choose anyone yourself."
      maxWidth="md"
    >
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Platform-managed assignment</CardTitle>
          <CardDescription>
            When you submit a trade request, TrustedMM reviews it and assigns platform oversight.
            Both parties are notified when assignment is complete.
          </CardDescription>
        </CardHeader>
        <ol className="space-y-3 text-sm text-slate-300 mb-6 list-decimal list-inside">
          <li>Submit your trade request with buyer and seller details</li>
          <li>TrustedMM reviews and completes platform assignment</li>
          <li>All parties receive notification to proceed in the trade room</li>
          <li>Verification, escrow, and completion follow platform process</li>
        </ol>
        <div className="flex flex-wrap gap-3">
          <a href="/create-trade">
            <Button>Request a Trade</Button>
          </a>
          <a href="/how-it-works">
            <Button variant="outline">How it works</Button>
          </a>
        </div>
        <p className="mt-4 text-xs text-slate-500">Redirecting to trade request…</p>
      </Card>
    </PageShell>
  );
}
