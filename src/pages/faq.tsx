import Header from '../components/Header';

export default function FAQ(){
  return (
    <div className="min-h-screen bg-deep text-white">
      <Header />
      <main className="pt-36 container mx-auto px-6 max-w-3xl">
        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
        <div className="mt-6 space-y-3">
          <details className="card-glass p-3">
            <summary className="font-semibold">How does a middleman work?</summary>
            <div className="mt-2 text-slate-300">A middleman holds assets in escrow until both parties confirm the trade.</div>
          </details>
          <details className="card-glass p-3">
            <summary className="font-semibold">How long does it take?</summary>
            <div className="mt-2 text-slate-300">Most trades complete within hours depending on verification speed.</div>
          </details>
          <details className="card-glass p-3">
            <summary className="font-semibold">How much does it cost?</summary>
            <div className="mt-2 text-slate-300">Fees depend on trade value; fees are shown before confirmation.</div>
          </details>
          <details className="card-glass p-3">
            <summary className="font-semibold">What happens if something goes wrong?</summary>
            <div className="mt-2 text-slate-300">Open a dispute and our team will review evidence and resolve fairly.</div>
          </details>
        </div>
      </main>
    </div>
  );
}
