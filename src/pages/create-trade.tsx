import { useState } from 'react';
import { useRouter } from 'next/router';
import { Check } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Alert,
} from '../components/ui';
import TradeProgress from '../components/trade/TradeProgress';
import StatusBadge from '../components/trade/StatusBadge';

const STEPS = [
  { id: 1, label: 'Parties' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Review' },
];

export default function CreateTrade() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [buyerUsername, setBuyerUsername] = useState('');
  const [sellerUsername, setSellerUsername] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function canAdvance(fromStep: number) {
    if (fromStep === 1) return buyerUsername.trim() && sellerUsername.trim();
    if (fromStep === 2) return title.trim() && description.trim();
    return true;
  }

  async function handleSubmit() {
    setError('');
    setSubmitting(true);
    try {
      const resp = await fetch('/api/trades/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          title,
          description,
          buyerUsername,
          sellerUsername,
          value: amount,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Create failed');
      router.push(`/rooms/${data.roomId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      title="Request a Trade"
      description="Submit a trade request. TrustedMM will review it and assign a verified escrow agent to protect both parties."
      maxWidth="lg"
    >
      {/* Step indicator */}
      <div className="mb-8">
        <ol className="flex items-center gap-2 sm:gap-4">
          {STEPS.map((s, index) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <li key={s.id} className="flex items-center gap-2 sm:gap-4 flex-1 last:flex-none">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold border transition-all ${
                      done
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
                        : active
                          ? 'bg-accent/20 border-accent/40 text-accent ring-2 ring-accent/30'
                          : 'bg-white/5 border-white/10 text-slate-500'
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden /> : s.id}
                  </div>
                  <span
                    className={`text-sm font-medium truncate hidden sm:inline ${
                      active ? 'text-white' : done ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block flex-1 h-px ${done ? 'bg-emerald-500/40' : 'bg-white/10'}`}
                    aria-hidden
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {step === 1 && (
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Trade parties</CardTitle>
                <CardDescription>
                  Enter the usernames of the buyer and seller. Both must have registered accounts.
                </CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <Input
                  label="Buyer username"
                  placeholder="buyer_username"
                  value={buyerUsername}
                  onChange={(e) => setBuyerUsername(e.target.value)}
                  autoComplete="off"
                />
                <Input
                  label="Seller username"
                  placeholder="seller_username"
                  value={sellerUsername}
                  onChange={(e) => setSellerUsername(e.target.value)}
                  autoComplete="off"
                />
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Trade details</CardTitle>
                <CardDescription>
                  Describe the deal and specify the trade value for escrow purposes.
                </CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <Input
                  label="Trade title"
                  placeholder="e.g. Digital asset transfer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="space-y-1.5">
                  <label htmlFor="description" className="block text-sm font-medium text-slate-200">
                    State the deal
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="app-input resize-y min-h-[120px]"
                    placeholder="Describe what is being exchanged, delivery terms, and any conditions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Input
                  label="Amount (USD)"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  hint="Escrow value held during the trade."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card padding="lg">
              <CardHeader>
                <CardTitle>Review & submit</CardTitle>
                <CardDescription>Confirm the details before creating your trade room.</CardDescription>
              </CardHeader>
              <dl className="space-y-4 text-sm">
                <ReviewRow label="Buyer" value={buyerUsername} />
                <ReviewRow label="Seller" value={sellerUsername} />
                <ReviewRow label="Title" value={title} />
                <ReviewRow label="Amount" value={amount ? `$${amount}` : '—'} />
                <div>
                  <dt className="text-slate-400 mb-1">Description</dt>
                  <dd className="text-white bg-white/5 rounded-xl p-3 border border-white/8 whitespace-pre-wrap">
                    {description || '—'}
                  </dd>
                </div>
              </dl>
              {error && (
                <Alert variant="error" className="mt-4">
                  {error}
                </Alert>
              )}
            </Card>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1 || submitting}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button
                onClick={() => {
                  if (canAdvance(step)) setStep((s) => s + 1);
                }}
                disabled={!canAdvance(step)}
              >
                Continue
              </Button>
            ) : (
              <Button loading={submitting} onClick={handleSubmit}>
                Create Trade
              </Button>
            )}
          </div>
        </div>

        {/* Preview sidebar */}
        <div className="lg:col-span-2">
          <Card padding="lg" className="sticky top-28">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Trade preview</CardTitle>
                <StatusBadge status="WAITING_FOR_MIDDLEMEN" />
              </div>
              <CardDescription>
              After submission, TrustedMM assigns a verified escrow agent and notifies all parties.
            </CardDescription>
            </CardHeader>
            <TradeProgress status="WAITING_FOR_MIDDLEMEN" />
            <div className="mt-6 pt-4 border-t border-white/8 space-y-2 text-sm">
              <PreviewLine label="Buyer" value={buyerUsername || '—'} />
              <PreviewLine label="Seller" value={sellerUsername || '—'} />
              <PreviewLine label="Title" value={title || '—'} />
              <PreviewLine label="Value" value={amount ? `$${amount}` : '—'} />
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-white/5 last:border-0">
      <dt className="text-slate-400 shrink-0">{label}</dt>
      <dd className="text-white font-medium text-right truncate">{value || '—'}</dd>
    </div>
  );
}

function PreviewLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-200 truncate">{value}</span>
    </div>
  );
}
