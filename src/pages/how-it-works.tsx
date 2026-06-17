import PageShell from '../components/layout/PageShell';
import Card, { CardDescription, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const steps = [
  {
    step: 1,
    title: 'Request a Trade',
    description: 'Submit trade details with buyer and seller information.',
  },
  {
    step: 2,
    title: 'Escrow Agent Assigned',
    description: 'TrustedMM reviews your request and assigns a verified escrow agent automatically.',
  },
  {
    step: 3,
    title: 'Verification',
    description: 'Identity and assets are verified before funds move.',
  },
  {
    step: 4,
    title: 'Completion',
    description: 'Upon confirmation, the assigned agent completes the trade securely.',
  },
];

export default function HowItWorks() {
  return (
    <PageShell
      title="How It Works"
      description="TrustedMM manages every trade: submit a request, receive automatic escrow assignment, verify assets, and complete securely."
      maxWidth="xl"
    >
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
        {steps.map((item) => (
          <Card key={item.step} hover padding="lg" className="relative">
            <Badge variant="info" className="mb-4">
              Step {item.step}
            </Badge>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription className="mt-2 leading-relaxed">{item.description}</CardDescription>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
