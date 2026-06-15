export default function Features(){
  const items = [
    { title: 'Secure Escrow', desc: 'Funds protected until completion.' },
    { title: 'Identity Verification', desc: 'Reduce scams and fraud.' },
    { title: 'Instant Notifications', desc: 'Real-time trade updates.' },
    { title: 'Dispute Resolution', desc: 'Professional mediation system.' },
    { title: 'Crypto Payments', desc: 'Fast and secure transactions.' },
    { title: 'Reputation System', desc: 'Public reviews and trust scores.' },
  ];

  return (
    <section className="container mx-auto px-6 py-12">
      <h2 className="text-3xl font-semibold mb-6">Features</h2>
      <div className="feature-grid">
        {items.map(it => (
          <div key={it.title} className="feature-card hover:translate-y-1 transition p-4">
            <div className="text-xl font-semibold mb-2">{it.title}</div>
            <div className="text-sm text-white/70">{it.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
