import PageShell from '../components/layout/PageShell';
import Card, { CardDescription, CardTitle } from '../components/ui/Card';

const pillars = [
  {
    icon: '🎯',
    title: 'Our Mission',
    description: 'To make peer-to-peer trades safe and transparent.',
  },
  {
    icon: '🔒',
    title: 'Security',
    description: 'Encryption, verification, and a trained dispute team protect users.',
  },
  {
    icon: '🤝',
    title: 'Platform Operations',
    description: 'TrustedMM assigns verified middlemen and manages every trade end-to-end.',
  },
];

export default function About() {
  return (
    <PageShell
      title="About TrustedMM"
      description="TrustedMM provides secure escrow services for digital trades. Verified staff assign middlemen, manage verification, and resolve disputes so both parties can trade with confidence."
      maxWidth="xl"
    >
      <section className="grid md:grid-cols-3 gap-5">
        {pillars.map((item) => (
          <Card key={item.title} hover padding="lg" className="text-center sm:text-left">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 text-2xl">
              {item.icon}
            </div>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription className="mt-2 leading-relaxed">{item.description}</CardDescription>
          </Card>
        ))}
      </section>
    </PageShell>
  );
}
