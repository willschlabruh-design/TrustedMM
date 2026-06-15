import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function Terms(){
  return (
    <div>
      <Head>
        <title>Terms of Service — Trusted</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <Header />
      <main className="bg-deep min-h-screen text-white pt-32">
        <section className="container mx-auto px-6 py-12">
          <h1 className="text-3xl font-semibold mb-4">Terms of Service</h1>

          <p className="mb-4 text-white/75">Effective date: {new Date().toISOString().slice(0,10)}</p>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">1. Acceptance</h2>
            <p className="text-white/75">By using Trusted ("the Service"), you agree to these Terms of Service and any policies referenced herein. If you do not agree, do not use the Service.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">2. Services</h2>
            <p className="text-white/75">Trusted provides an escrow and middleman service to facilitate digital asset trades between users. We hold funds in escrow during a trade and release them according to trade terms and these policies.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">3. Fees</h2>
            <p className="text-white/75 mb-2">Platform fee: 3% of the trade value (minimum $3.00 USD).</p>
            <p className="text-white/75">Fees are calculated and displayed before you confirm a trade. By confirming a trade you authorize Trusted to collect the applicable fees.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">4. Refunds and Non-Refundable Fees</h2>
            <p className="text-white/75 mb-2">All fees collected by Trusted are non-refundable after the trade has been completed and funds have been released from escrow.</p>
            <p className="text-white/75">If a trade is cancelled prior to completion, fee handling will be governed by the specific trade agreement and any applicable promotion or policy; Trusted reserves the right to retain fees for services rendered (including but not limited to verification, administrative processing, and dispute handling).</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">5. Dispute Resolution</h2>
            <p className="text-white/75">If a dispute arises, Trusted offers a dispute resolution process. Our decision in disputes is final for the purposes of escrow release. Separate legal remedies may remain available to parties.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">6. Liability</h2>
            <p className="text-white/75">Trusted acts as a neutral escrow and facilitator. To the maximum extent permitted by law, Trusted is not liable for indirect, incidental, special, consequential, or punitive damages arising from trades or use of the Service.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">7. Changes to Terms</h2>
            <p className="text-white/75">We may modify these Terms of Service. Material changes will be communicated in advance where reasonably possible. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
          </div>

          <div className="card-glass p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2">8. Contact</h2>
            <p className="text-white/75">If you have questions about these Terms, contact our support team via the Contact page.</p>
          </div>

          <p className="text-sm text-white/70">This Terms of Service page is a summary. Refer to the <a href="/legal" className="underline">full legal agreement</a> for complete details.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
