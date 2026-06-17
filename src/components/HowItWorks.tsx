export default function HowItWorks() {
  const steps = [
    { title: 'Request a Trade', desc: 'Submit trade details and both party information.' },
    { title: 'Escrow Agent Assigned', desc: 'TrustedMM reviews your request and assigns a verified escrow agent.' },
    { title: 'Verification', desc: 'Identity and assets are verified before funds move.' },
    { title: 'Secure Completion', desc: 'Funds are released after both parties confirm delivery.' },
  ];

  return (
    <section id="how" className="container mx-auto px-6 py-12">
      <h2 className="text-3xl font-semibold mb-6">How It Works</h2>
      <div className="timeline">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className="timeline-step card-glass p-4 hover:border-white/15 transition-colors duration-200"
          >
            <div className="timeline-icon mr-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground text-sm font-bold">
                {i + 1}
              </div>
            </div>
            <div>
              <div className="font-semibold text-white">{s.title}</div>
              <div className="text-sm text-slate-300">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
