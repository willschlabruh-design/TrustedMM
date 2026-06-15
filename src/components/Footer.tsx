export default function Footer(){
  return (
    <footer className="site-footer bg-transparent">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <img src="/api/assets/logo" alt="Trusted" className="w-12 h-12 inline-block mr-3" />
            <span className="font-semibold">Trusted</span>
            <div className="text-sm mt-1">Secure escrow for digital asset trades.</div>
          </div>

          <div className="flex gap-6 text-sm">
            <a href="/privacy-policy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/legal">Legal</a>
            <a href="/contact">Contact</a>
          </div>

          <div className="text-sm">© {new Date().getFullYear()} Trusted — All rights reserved</div>
        </div>
      </div>
    </footer>
  );
}
