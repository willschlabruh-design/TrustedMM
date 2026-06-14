import Particles from './Particles';

export default function Hero(){
  return (
    <section className="relative pt-36 pb-20 overflow-hidden">
      <Particles />
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center gap-8 relative z-50">
        <div className="flex-1">
               <img src="/api/assets/logo" alt="MiddleMan logo" className="w-20 h-20 rounded-full mb-4 shadow-md" />
            <h1 className="text-5xl font-extrabold">Secure Trades. Trusted Every Time.</h1>
          <p className="mt-4 text-slate-200 max-w-xl">We safely hold digital assets until both parties complete their agreement.</p>
          <div className="mt-6 flex gap-4">
            {/* Middleman functionality removed — platform uses fixed admins/middlemen */}
          </div>
        </div>
        <div className="flex-1">
          <div id="hero-float" className="w-full h-64 rounded-xl bg-gradient-to-br from-primary/30 to-indigo-900/30 flex items-center justify-center shadow-lg">
            <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6b78ff" />
                  <stop offset="100%" stopColor="#ffcf4d" />
                </linearGradient>
              </defs>
              <rect width="220" height="220" rx="20" fill="url(#g1)" opacity="0.12" />
              <g transform="translate(36,36)">
                <circle cx="74" cy="30" r="22" fill="#fff" opacity="0.06" />
                <rect x="0" y="70" width="148" height="28" rx="6" fill="#fff" opacity="0.06" />
                <rect x="0" y="110" width="110" height="18" rx="6" fill="#fff" opacity="0.04" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
