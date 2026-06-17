import Link from 'next/link';
import {
  FileText,
  ClipboardCheck,
  ShieldCheck,
  CircleCheck,
  Lock,
  BadgeCheck,
  Scale,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import PageShell from '../components/layout/PageShell';
import Card, { CardDescription, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { cn } from '../lib/cn';

type ProcessStep = {
  step: number;
  title: string;
  description: string;
  timeline: string;
  icon: LucideIcon;
};

const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    title: 'Request a Trade',
    description:
      'Submit trade details, buyer and seller information, and asset description. Both parties receive confirmation instantly.',
    timeline: 'Usually under 5 minutes',
    icon: FileText,
  },
  {
    step: 2,
    title: 'TrustedMM Assignment',
    description:
      'TrustedMM reviews your request and assigns platform oversight automatically. No browsing, no choosing — the platform manages every trade.',
    timeline: 'Typically 1–2 hours',
    icon: ClipboardCheck,
  },
  {
    step: 3,
    title: 'Platform Verification',
    description:
      'TrustedMM runs identity checks and asset verification through our secure verification process before any funds move.',
    timeline: 'Usually 2–24 hours',
    icon: ShieldCheck,
  },
  {
    step: 4,
    title: 'Secure Completion',
    description:
      'Funds release only after both parties confirm delivery. TrustedMM records the outcome and closes the trade securely.',
    timeline: 'Varies by trade complexity',
    icon: CircleCheck,
  },
];

const TRUST_INDICATORS = [
  { label: 'Platform-Managed', desc: 'Every trade overseen by TrustedMM', icon: BadgeCheck },
  { label: 'Encrypted Escrow', desc: 'Funds held until confirmation', icon: Lock },
  { label: 'Dispute Resolution', desc: 'Neutral platform review team', icon: Scale },
  { label: 'Identity Verified', desc: 'Secure verification process', icon: ShieldCheck },
];

const ESCROW_FLOW = [
  { label: 'Buyer submits', status: 'Request received' },
  { label: 'TrustedMM review', status: 'Assignment complete' },
  { label: 'Funds in escrow', status: 'Assets protected' },
  { label: 'Trade complete', status: 'Secure release' },
];

const FAQ_ITEMS = [
  {
    q: 'How does TrustedMM assignment work?',
    a: 'You submit a trade request. TrustedMM reviews it and assigns platform oversight — you never browse or select anyone yourself.',
  },
  {
    q: 'How long does the full process take?',
    a: 'Most trades complete within hours. Verification and participant response times are the main variables.',
  },
  {
    q: 'What happens if something goes wrong?',
    a: 'Open a dispute and TrustedMM reviews evidence through our dispute resolution process.',
  },
  {
    q: 'How much does it cost?',
    a: 'Fees depend on trade value and are disclosed before you confirm your request.',
  },
];

export default function HowItWorksPage() {
  return (
    <PageShell
      title="How It Works"
      description="TrustedMM manages every trade from request to completion — platform assignment, verification, escrow, and secure release."
      maxWidth="2xl"
    >
      {/* Trust strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {TRUST_INDICATORS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Process timeline */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-6">The TrustedMM Process</h2>
        <div className="relative">
          <div
            className="hidden lg:block absolute left-[2.75rem] top-8 bottom-8 w-0.5 bg-gradient-to-b from-accent/60 via-accent/30 to-emerald-500/40"
            aria-hidden
          />
          <ol className="space-y-5">
            {PROCESS_STEPS.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === PROCESS_STEPS.length - 1;
              return (
                <li key={item.step} className="relative">
                  <Card padding="lg" hover className="lg:ml-0">
                    <div className="flex flex-col sm:flex-row gap-5">
                      <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3 shrink-0">
                        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
                          <Icon className="h-6 w-6" strokeWidth={2} aria-hidden />
                        </div>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 border border-accent/25 px-2.5 py-1 text-xs font-semibold text-accent">
                          <Clock className="h-3 w-3" aria-hidden />
                          {item.timeline}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-accent-foreground text-xs font-bold">
                            {item.step}
                          </span>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                        </div>
                        <CardDescription className="text-sm leading-relaxed text-slate-300">
                          {item.description}
                        </CardDescription>
                      </div>
                    </div>
                  </Card>
                  {!isLast && (
                    <div className="lg:hidden flex justify-center py-2" aria-hidden>
                      <ArrowRight className="h-4 w-4 text-accent/50 rotate-90" />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Escrow flow visual */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-white mb-2">Escrow Flow</h2>
        <p className="text-sm text-slate-400 mb-6">
          A visual overview of how TrustedMM protects funds from request to completion.
        </p>
        <Card padding="lg" className="overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
            <div
              className="hidden md:block absolute top-6 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-accent/40 via-accent/20 to-emerald-500/40"
              aria-hidden
            />
            {ESCROW_FLOW.map((stage, index) => (
              <div key={stage.label} className="relative flex flex-col items-center text-center gap-3">
                <div
                  className={cn(
                    'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold',
                    index === 0
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-navy-800 text-slate-200 border-white/15'
                  )}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{stage.label}</p>
                  <p className="text-xs text-slate-400 mt-1">{stage.status}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-400">
            <Lock className="h-4 w-4 text-accent" aria-hidden />
            <span>Funds remain in encrypted escrow until both parties confirm completion</span>
          </div>
        </Card>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-white mb-6">Common Questions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {FAQ_ITEMS.map((item) => (
            <Card key={item.q} padding="md" hover>
              <CardTitle className="text-base">{item.q}</CardTitle>
              <CardDescription className="mt-2 leading-relaxed">{item.a}</CardDescription>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-sm text-slate-400">
          More answers on our{' '}
          <Link href="/faq" className="text-accent hover:text-accent-hover font-medium transition-colors">
            FAQ page
          </Link>
          .
        </p>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/10 via-transparent to-emerald-500/5 p-8 text-center">
        <h2 className="text-2xl font-bold text-white">Ready to trade securely?</h2>
        <p className="mt-2 text-slate-300 max-w-lg mx-auto">
          Submit a trade request and let TrustedMM handle assignment, verification, and completion.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/create-trade">
            <Button size="lg">Request a Trade</Button>
          </Link>
          <Link href="/trust-safety">
            <Button variant="outline" size="lg">
              Trust &amp; Safety
            </Button>
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
