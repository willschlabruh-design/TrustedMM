import { useEffect, useState } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-bold mb-2">Cookie Policy</h3>
          <p className="text-sm text-gray-300">
            We use cookies to enhance your experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies. Read our{' '}
            <a href="/privacy-policy" className="underline hover:text-blue-400">
              Privacy Policy
            </a>{' '}
            for details.
          </p>
        </div>
        <div className="flex gap-2 whitespace-nowrap">
          <button
            onClick={rejectCookies}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
          >
            Reject
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition font-semibold"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
