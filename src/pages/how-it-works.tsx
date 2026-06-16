import PageShell from '../components/layout/PageShell';
import Card, { CardDescription, CardTitle } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

const steps = [
  {
    step: 1,
    title: 'Create Trade',
    description: 'Buyer creates a trade request specifying terms.',
  },
  {
    step: 2,
    title: 'Middleman Assigned',
    description: 'A verified middleman accepts and secures the assets.',
  },
  {
    step: 3,
    title: 'Verification',
    description: 'Assets are checked and confirmed by participants.',
  },
  {
    step: 4,
    title: 'Release',
    description: 'Upon confirmation, the middleman releases assets to the recipient.',
  },
];

export default function HowItWorks() {
  return (
    <PageShell
      title="How It Works"
      description="A secure trade involves four clear steps: create the trade, assign a verified middleman, verify assets, and release funds or items."
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
