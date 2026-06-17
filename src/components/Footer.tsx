import BrandLogo from './BrandLogo';
import { cn } from '../lib/cn';

export default function Footer({ className = '' }: { className?: string }) {
  return (
    <footer className={cn('site-footer bg-transparent', className)}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo width={56} height={56} priority className="inline-block ring-1 ring-white/10" />
            <div>
              <span className="font-semibold">TrustedMM</span>
              <div className="text-sm mt-1 text-slate-400">Secure escrow for digital asset trades.</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm">
            <a href="/privacy-policy" className="text-slate-300 hover:text-white transition-colors duration-200">Privacy</a>
            <a href="/terms" className="text-slate-300 hover:text-white transition-colors duration-200">Terms</a>
            <a href="/legal" className="text-slate-300 hover:text-white transition-colors duration-200">Legal</a>
            <a href="/contact" className="text-slate-300 hover:text-white transition-colors duration-200">Contact</a>
          </div>

          <div className="text-sm text-slate-500">© {new Date().getFullYear()} TrustedMM — All rights reserved</div>
        </div>
      </div>
    </footer>
  );
}
