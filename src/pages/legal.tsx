import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Legal(){
  return (
    <div>
      <Head>
        <title>Full Legal Agreement — Trusted</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <Header />
      <main className="bg-deep min-h-screen text-white pt-32">
        <section className="container mx-auto px-6 py-12">
          <h1 className="text-3xl font-semibold mb-4">Full Legal Agreement</h1>
          <p className="text-white/75 mb-6">This is the full, legally detailed version of our Terms, policies, and service agreement. It contains comprehensive provisions governing the use of Trusted.</p>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">1. Definitions</h2>
            <p className="text-white/75">"Service" means the Trusted platform and related services. "User", "you" and "your" mean any person or entity using the Service. "Trade" means an escrow transaction facilitated by the Service.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">2. Scope of Services</h2>
            <p className="text-white/75">Trusted provides escrow, middleman assignment, verification, and dispute resolution services to facilitate exchanges of digital assets between users. We may provide ancillary services such as notifications, identity verification, analytics, and wallet integrations.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">3. Fees and Billing</h2>
            <p className="text-white/75 mb-2">Platform fees are assessed at 3% of the trade value with a minimum fee of USD 3.00 per trade. Fees apply to the gross trade amount and are calculated at the time the trade is confirmed. If currency conversion is required, the conversion rate and any conversion fees are applied as described to the user during checkout.</p>
            <p className="text-white/75">Users authorize Trusted to charge applicable fees and to deduct fees from escrowed funds prior to release. For certain payment methods, third-party processor fees may also apply and will be disclosed at time of payment.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">4. Refunds; Non-Refundable Fees</h2>
            <p className="text-white/75 mb-2">Except as expressly provided in this Agreement or as required by applicable law, fees charged by Trusted are non-refundable after the trade has been completed and escrow funds have been released. Completion is defined as the date on which Trusted releases funds from escrow in accordance with the trade terms or final dispute resolution.</p>
            <p className="text-white/75 mb-2">In limited circumstances where Trusted cancels a trade or in cases of manifest error, we may provide refunds or credits at our discretion. Where third-party processors charge fees for payment reversals or chargebacks, such fees may be deducted from any refund amount.</p>
            <p className="text-white/75">Any promotional credits, discounts, or fee waivers are subject to specific terms and may be non-transferable and non-refundable.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">5. Identity Verification, KYC and AML</h2>
            <p className="text-white/75">Trusted may require identity verification for users, including collection of government ID, selfie, proof of address, or other documentation. We may share information with third-party verification providers. Compliance with KYC/AML laws may require reporting and cooperation with law enforcement.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">6. Dispute Resolution and Escrow Release</h2>
            <p className="text-white/75 mb-2">If parties disagree on fulfillment of trade terms, Trusted provides a dispute process. Users must submit evidence as requested. Trusted’s decision is final with respect to escrow release, subject to applicable law; Trusted will consider evidence, timestamps, verification records, and communications archived on the platform.</p>
            <p className="text-white/75">While Trusted facilitates dispute resolution, users retain the right to pursue external legal remedies. Any fees incurred for dispute handling are not necessarily refundable.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">7. User Conduct</h2>
            <p className="text-white/75">Users must comply with applicable laws. Prohibited activities include fraud, money laundering, sale of illegal goods, and manipulative trade practices. Trusted reserves the right to suspend or terminate accounts for violations.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">8. Data and Privacy</h2>
            <p className="text-white/75">Collection, use, and retention of personal data is governed by our Privacy Policy. Users consent to collection and processing of their data for compliance, fraud prevention, and service operation.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">9. Intellectual Property</h2>
            <p className="text-white/75">Trusted and its licensors retain all rights, title, and interest in the Service, trademarks, and content. Users grant Trusted a license to use content as necessary to provide the Service.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">10. Termination</h2>
            <p className="text-white/75">Trusted may suspend or terminate accounts for violations or suspicious activity. Upon termination, certain provisions (fees, indemnities, liability limitations) survive as described.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">11. Governing Law</h2>
            <p className="text-white/75">These terms are governed by the laws specified in your account region or as specified by Trusted. Where required, specify jurisdiction and dispute resolution forum here.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">12. Changes and Notice</h2>
            <p className="text-white/75">Trusted may modify these terms; material changes will be communicated by email or notice on the platform. Continued use after notice constitutes acceptance.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">13. Contact</h2>
            <p className="text-white/75">For legal inquiries, contact support via the Contact page or email legal@trusted.example (replace with your legal contact).</p>
          </div>

          <p className="text-sm text-white/70">This page is the full legal agreement for the Service. For clarity on fees and trade-level rules, refer to the Pricing and Trade documentation provided on the platform.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
