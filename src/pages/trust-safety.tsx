import PageShell from '../components/layout/PageShell';
import Card, { CardDescription, CardTitle } from '../components/ui/Card';

const features = [
  {
    icon: '✓',
    title: 'Verification',
    description:
      'All staff and middlemen undergo identity checks and background review.',
  },
  {
    icon: '🔐',
    title: 'Escrow & Encryption',
    description: 'Trades use encrypted escrow to protect assets until both parties confirm.',
  },
  {
    icon: '⚖️',
    title: 'Dispute Resolution',
    description: 'A neutral review team evaluates disputes with transparent policies.',
  },
  {
    icon: '🛡️',
    title: 'Anti-Scam',
    description: 'We monitor patterns and act quickly to suspend malicious actors.',
  },
];

export default function TrustSafety() {
  return (
    <PageShell
      title="Trust & Safety"
      description="We prioritize safety with identity verification, encrypted storage, dispute resolution, and proactive anti-scam monitoring."
      maxWidth="lg"
    >
      <section className="grid md:grid-cols-2 gap-5">
        {features.map((item) => (
          <Card key={item.title} hover padding="lg">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/20 text-lg">
                {item.icon}
              </div>
              <div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription className="mt-2 leading-relaxed">
                  {item.description}
                </CardDescription>
              </div>
            </div>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}
