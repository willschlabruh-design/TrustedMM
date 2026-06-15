export default function HowItWorks(){
  const steps = [
    { title: 'Create Trade', desc: 'Initiate the trade and set terms.' },
    { title: 'Middleman Assigned', desc: 'A verified middleman accepts the trade.' },
    { title: 'Verification', desc: 'IDs and assets are verified by both parties.' },
    { title: 'Release Funds', desc: 'Funds are released after successful delivery.' },
  ];

  return (
    <section id="how" className="container mx-auto px-6 py-12">
      <h2 className="text-3xl font-semibold mb-6">How It Works</h2>
      <div className="timeline">
        {steps.map((s, i) => (
          <div key={s.title} className="timeline-step card-glass p-4 hover:scale-[1.01] transition">
            <div className="timeline-icon mr-4">
              <div className="text-xl">{i+1}</div>
            </div>
            <div>
              <div className="font-semibold">{s.title}</div>
              <div className="text-sm text-white/70">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
