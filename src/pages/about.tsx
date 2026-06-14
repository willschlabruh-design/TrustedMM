import Header from '../components/Header';

export default function About(){
  return (
    <div className="min-h-screen bg-deep text-white">
      <Header />
      <main className="pt-36 container mx-auto px-6">
        <h1 className="text-3xl font-bold">About MiddleMan</h1>
        <p className="mt-4 max-w-2xl text-slate-200">MiddleMan provides secure escrow services for digital trades. Our verified staff and robust dispute resolution ensure both parties can trade with confidence.</p>
        <section className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="card-glass">
            <h3 className="font-semibold">Our Mission</h3>
            <p className="text-slate-300 mt-2">To make peer-to-peer trades safe and transparent.</p>
          </div>
          <div className="card-glass">
            <h3 className="font-semibold">Security</h3>
            <p className="text-slate-300 mt-2">Encryption, verification, and a trained dispute team protect users.</p>
          </div>
          <div className="card-glass">
            <h3 className="font-semibold">Community</h3>
            <p className="text-slate-300 mt-2">A trusted network of middlemen and verified traders.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
