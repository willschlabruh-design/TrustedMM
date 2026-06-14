import Header from '../components/Header';

export default function TrustSafety(){
  return (
    <div className="min-h-screen bg-deep text-white">
      <Header />
      <main className="pt-36 container mx-auto px-6 max-w-4xl">
        <h1 className="text-3xl font-bold">Trust & Safety</h1>
        <p className="mt-3 text-slate-200">We prioritize safety with identity verification, encrypted storage, dispute resolution, and proactive anti-scam monitoring.</p>
        <section className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="card-glass">
            <h4 className="font-semibold">Verification</h4>
            <p className="text-slate-300 mt-2">All staff and middlemen undergo identity checks and background review.</p>
          </div>
          <div className="card-glass">
            <h4 className="font-semibold">Escrow & Encryption</h4>
            <p className="text-slate-300 mt-2">Trades use encrypted escrow to protect assets until both parties confirm.</p>
          </div>
          <div className="card-glass">
            <h4 className="font-semibold">Dispute Resolution</h4>
            <p className="text-slate-300 mt-2">A neutral review team evaluates disputes with transparent policies.</p>
          </div>
          <div className="card-glass">
            <h4 className="font-semibold">Anti-Scam</h4>
            <p className="text-slate-300 mt-2">We monitor patterns and act quickly to suspend malicious actors.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
