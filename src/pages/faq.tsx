import PageShell from '../components/layout/PageShell';
import Card from '../components/ui/Card';

const faqs = [
  {
    question: 'How does a middleman work?',
    answer: 'A middleman holds assets in escrow until both parties confirm the trade.',
  },
  {
    question: 'How long does it take?',
    answer: 'Most trades complete within hours depending on verification speed.',
  },
  {
    question: 'How much does it cost?',
    answer: 'Fees depend on trade value; fees are shown before confirmation.',
  },
  {
    question: 'What happens if something goes wrong?',
    answer: 'Open a dispute and our team will review evidence and resolve fairly.',
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
