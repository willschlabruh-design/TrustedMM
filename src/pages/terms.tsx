import Head from 'next/head';
import PageShell from '../components/layout/PageShell';
import Card, { CardDescription, CardTitle } from '../components/ui/Card';

const sections = [
  {
    title: '1. Acceptance',
    body: 'By using Trusted ("the Service"), you agree to these Terms of Service and any policies referenced herein. If you do not agree, do not use the Service.',
  },
  {
    title: '2. Services',
    body: 'Trusted provides an escrow and middleman service to facilitate digital asset trades between users. We hold funds in escrow during a trade and release them according to trade terms and these policies.',
  },
  {
    title: '3. Fees',
    body: 'Platform fee: 3% of the trade value (minimum $3.00 USD). Fees are calculated and displayed before you confirm a trade. By confirming a trade you authorize Trusted to collect the applicable fees.',
  },
  {
    title: '4. Refunds and Non-Refundable Fees',
    body: 'All fees collected by Trusted are non-refundable after the trade has been completed and funds have been released from escrow. If a trade is cancelled prior to completion, fee handling will be governed by the specific trade agreement and any applicable promotion or policy; Trusted reserves the right to retain fees for services rendered (including but not limited to verification, administrative processing, and dispute handling).',
  },
  {
    title: '5. Dispute Resolution',
    body: 'If a dispute arises, Trusted offers a dispute resolution process. Our decision in disputes is final for the purposes of escrow release. Separate legal remedies may remain available to parties.',
  },
  {
    title: '6. Liability',
    body: 'Trusted acts as a neutral escrow and facilitator. To the maximum extent permitted by law, Trusted is not liable for indirect, incidental, special, consequential, or punitive damages arising from trades or use of the Service.',
  },
  {
    title: '7. Changes to Terms',
    body: 'We may modify these Terms of Service. Material changes will be communicated in advance where reasonably possible. Continued use of the Service after changes constitutes acceptance of the updated terms.',
  },
  {
    title: '8. Contact',
    body: 'If you have questions about these Terms, contact our support team via the Contact page.',
  },
];

export default function Terms() {
  const effectiveDate = new Date().toISOString().slice(0, 10);

  return (
    <>
      <Head>
        <title>Terms of Service — Trusted</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <PageShell title="Terms of Service" maxWidth="lg">
        <p className="-mt-4 mb-8 text-sm text-slate-400">Effective date: {effectiveDate}</p>

        <div className="grid gap-5">
          {sections.map((section) => (
            <Card key={section.title} padding="lg">
              <CardTitle className="text-xl">{section.title}</CardTitle>
              <CardDescription className="mt-3 leading-relaxed text-slate-300">
                {section.body}
              </CardDescription>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-sm text-slate-400">
          This Terms of Service page is a summary. Refer to the{' '}
          <a href="/legal" className="text-accent hover:underline">
            full legal agreement
          </a>{' '}
          for complete details.
        </p>
      </PageShell>
    </>
  );
}
