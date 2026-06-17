import PageShell from '../components/layout/PageShell';
import Card from '../components/ui/Card';

const faqs = [
  {
    question: 'How does TrustedMM assignment work?',
    answer:
      'You submit a trade request. TrustedMM reviews it and assigns platform oversight — you do not browse or choose anyone yourself.',
  },
  {
    question: 'How long does a trade take?',
    answer: 'Most trades complete within hours depending on verification and participant response times.',
  },
  {
    question: 'How much does it cost?',
    answer: 'Fees depend on trade value and are disclosed before you confirm.',
  },
  {
    question: 'What happens if something goes wrong?',
    answer: 'Open a dispute and our team reviews evidence to resolve the issue fairly.',
  },
];

export default function FAQ() {
  return (
    <PageShell title="Frequently Asked Questions" maxWidth="md">
      <div className="space-y-3">
        {faqs.map((item) => (
          <Card key={item.question} padding="sm" hover className="group">
            <details className="[&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-2 px-1 font-semibold text-white marker:content-none">
                <span>{item.question}</span>
                <span className="shrink-0 text-slate-500 transition-transform group-open:rotate-180">
                  ▾
                </span>
              </summary>
              <p className="mt-2 pb-2 px-1 text-sm text-slate-300 leading-relaxed">{item.answer}</p>
            </details>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
