import Head from 'next/head';
import Header from '../components/Header';
import Hero from '../components/Hero';

export default function Home(){
  return (
    <div>
      <Head>
        <title>MiddleMan — Secure Trades</title>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </Head>
      <Header />
      <main className="bg-deep min-h-screen text-white">
        <Hero />
        <section className="container mx-auto px-6 py-12">
          <h2 className="text-2xl font-semibold mb-6">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-white/6 rounded-lg">Create Trade</div>
            <div className="p-4 bg-white/6 rounded-lg">Middleman Assigned</div>
            <div className="p-4 bg-white/6 rounded-lg">Verification</div>
            <div className="p-4 bg-white/6 rounded-lg">Release</div>
          </div>
        </section>
      </main>
    </div>
  );
}
