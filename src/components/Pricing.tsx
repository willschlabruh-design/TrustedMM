export default function Pricing(){
  return (
    <section className="container mx-auto px-6 py-10">
      <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
      <div className="pricing-card">
        <div className="pricing-row mb-3">
          <div>
            <div className="text-sm text-white/70">Platform fee</div>
            <div className="price-tag">3% of trade value (minimum $3)</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/60">Non-refundable</div>
            <div className="small-note">All fees are non-refundable after the trade is complete.</div>
          </div>
        </div>

        <div className="text-sm text-white/70">For more details about fees, disputes, and refunds, see our <a href="/terms" className="underline">Terms of Service</a>.</div>
      </div>
    </section>
  );
}
