import Header from '../components/Header';

export default function HowItWorks(){
  return (
    <div className="min-h-screen bg-deep text-white">
      <Header />
      <main className="pt-36 container mx-auto px-6">
        <h1 className="text-3xl font-bold">How It Works</h1>
        <p className="mt-3 text-slate-200 max-w-2xl">A secure trade involves four clear steps: create the trade, assign a verified middleman, verify assets, and release funds or items.</p>
        <div className="mt-8 grid md:grid-cols-4 gap-6">
          <div className="card-glass">
            <h4 className="font-semibold">1. Create Trade</h4>
            <p className="text-slate-300 mt-2">Buyer creates a trade request specifying terms.</p>
          </div>
          <div className="card-glass">
            <h4 className="font-semibold">2. Middleman Assigned</h4>
            <p className="text-slate-300 mt-2">A verified middleman accepts and secures the assets.</p>
          </div>
          <div className="card-glass">
            <h4 className="font-semibold">3. Verification</h4>
            <p className="text-slate-300 mt-2">Assets are checked and confirmed by participants.</p>
          </div>
          <div className="card-glass">
            <h4 className="font-semibold">4. Release</h4>
            <p className="text-slate-300 mt-2">Upon confirmation, the middleman releases assets to the recipient.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
