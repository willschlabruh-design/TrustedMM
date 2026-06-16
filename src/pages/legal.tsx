import Head from 'next/head';
import PageShell from '../components/layout/PageShell';
import Card, { CardDescription, CardTitle } from '../components/ui/Card';

const sections = [
  {
    title: '1. Definitions',
    body: '"Service" means the Trusted platform and related services. "User", "you" and "your" mean any person or entity using the Service. "Trade" means an escrow transaction facilitated by the Service.',
  },
  {
    title: '2. Scope of Services',
    body: 'Trusted provides escrow, middleman assignment, verification, and dispute resolution services to facilitate exchanges of digital assets between users. We may provide ancillary services such as notifications, identity verification, analytics, and wallet integrations.',
  },
  {
    title: '3. Fees and Billing',
    body: 'Platform fees are assessed at 3% of the trade value with a minimum fee of USD 3.00 per trade. Fees apply to the gross trade amount and are calculated at the time the trade is confirmed. If currency conversion is required, the conversion rate and any conversion fees are applied as described to the user during checkout. Users authorize Trusted to charge applicable fees and to deduct fees from escrowed funds prior to release. For certain payment methods, third-party processor fees may also apply and will be disclosed at time of payment.',
  },
  {
    title: '4. Refunds; Non-Refundable Fees',
    body: 'Except as expressly provided in this Agreement or as required by applicable law, fees charged by Trusted are non-refundable after the trade has been completed and escrow funds have been released. Completion is defined as the date on which Trusted releases funds from escrow in accordance with the trade terms or final dispute resolution. In limited circumstances where Trusted cancels a trade or in cases of manifest error, we may provide refunds or credits at our discretion. Where third-party processors charge fees for payment reversals or chargebacks, such fees may be deducted from any refund amount. Any promotional credits, discounts, or fee waivers are subject to specific terms and may be non-transferable and non-refundable.',
  },
  {
    title: '5. Identity Verification, KYC and AML',
    body: 'Trusted may require identity verification for users, including collection of government ID, selfie, proof of address, or other documentation. We may share information with third-party verification providers. Compliance with KYC/AML laws may require reporting and cooperation with law enforcement.',
  },
  {
    title: '6. Dispute Resolution and Escrow Release',
    body: 'If parties disagree on fulfillment of trade terms, Trusted provides a dispute process. Users must submit evidence as requested. Trusted’s decision is final with respect to escrow release, subject to applicable law; Trusted will consider evidence, timestamps, verification records, and communications archived on the platform. While Trusted facilitates dispute resolution, users retain the right to pursue external legal remedies. Any fees incurred for dispute handling are not necessarily refundable.',
  },
  {
    title: '7. User Conduct',
    body: 'Users must comply with applicable laws. Prohibited activities include fraud, money laundering, sale of illegal goods, and manipulative trade practices. Trusted reserves the right to suspend or terminate accounts for violations.',
  },
  {
    title: '8. Data and Privacy',
    body: 'Collection, use, and retention of personal data is governed by our Privacy Policy. Users consent to collection and processing of their data for compliance, fraud prevention, and service operation.',
  },
  {
    title: '9. Intellectual Property',
    body: 'Trusted and its licensors retain all rights, title, and interest in the Service, trademarks, and content. Users grant Trusted a license to use content as necessary to provide the Service.',
  },
  {
    title: '10. Termination',
    body: 'Trusted may suspend or terminate accounts for violations or suspicious activity. Upon termination, certain provisions (fees, indemnities, liability limitations) survive as described.',
  },
  {
    title: '11. Governing Law',
    body: 'These terms are governed by the laws specified in your account region or as specified by Trusted. Where required, specify jurisdiction and dispute resolution forum here.',
  },
  {
    title: '12. Changes and Notice',
    body: 'Trusted may modify these terms; material changes will be communicated by email or notice on the platform. Continued use after notice constitutes acceptance.',
  },
  {
    title: '13. Contact',
    body: 'For legal inquiries, contact us via the Contact page or email william.schlanbusch@gmail.com.',
  },
];

export default function Legal() {
  return (
    <>
      <Head>
        <title>Full Legal Agreement — Trusted</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <PageShell
        title="Full Legal Agreement"
        description="This is the full, legally detailed version of our Terms, policies, and service agreement. It contains comprehensive provisions governing the use of Trusted."
        maxWidth="lg"
      >
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
          This page is the full legal agreement for the Service. For clarity on fees and trade-level
          rules, refer to the Pricing and Trade documentation provided on the platform.
        </p>
      </PageShell>
    </>
  );
}
