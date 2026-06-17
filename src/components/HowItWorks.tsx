import { FileText, ClipboardCheck, ShieldCheck, CircleCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const steps: Array<{ title: string; desc: string; icon: LucideIcon }> = [
  {
    title: 'Request a Trade',
    desc: 'Submit trade details and both party information.',
    icon: FileText,
  },
  {
    title: 'TrustedMM Assignment',
    desc: 'TrustedMM reviews your request and assigns platform oversight automatically.',
    icon: ClipboardCheck,
  },
  {
    title: 'Platform Verification',
    desc: 'Identity and assets are verified through our secure verification process.',
    icon: ShieldCheck,
  },
  {
    title: 'Secure Completion',
    desc: 'Funds are released after both parties confirm delivery.',
    icon: CircleCheck,
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="container mx-auto px-6 py-12">
      <h2 className="text-3xl font-semibold mb-6">How It Works</h2>
      <div className="timeline">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              className="timeline-step card-glass p-4 hover:border-white/15 transition-colors duration-200"
            >
              <div className="timeline-icon mr-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-accent/20 text-accent text-[10px] font-bold">
                    {i + 1}
                  </span>
                  <div className="font-semibold text-white">{s.title}</div>
                </div>
                <div className="text-sm text-slate-300">{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
