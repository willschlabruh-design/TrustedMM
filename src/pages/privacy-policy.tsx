import Header from '../components/Header';

export default function PrivacyPolicy() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">Privacy Policy & Cookie Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">1. Overview</h2>
            <p className="text-gray-700 mb-4">
              MiddleMan ("we", "us", "our", or "Company") operates the MiddleMan platform. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service and the choices you have associated with that data.
            </p>
          </section>

          <section className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">2. Cookie Policy</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                <strong>What are Cookies?</strong><br />
                Cookies are small text files that are stored on your device when you visit our website. They help us recognize you and remember your preferences.
              </p>
              
              <p>
                <strong>Types of Cookies We Use:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for authentication, security, and platform functionality.</li>
                <li><strong>Session Cookies:</strong> Used to maintain your login session and user preferences.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform to improve your experience.</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences.</li>
              </ul>

              <p>
                <strong>Your Cookie Choices:</strong><br />
                You can control cookies through your browser settings. However, disabling essential cookies may limit your ability to use certain features of our service.
              </p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">3. Information Collection and Use</h2>
            <div className="text-gray-700 space-y-4">
              <p>
                We collect information you provide directly (email, name, account credentials) and information collected automatically (IP address, browser type, pages visited).
              </p>
              <p>
                <strong>We use this information to:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide and maintain our service</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect and prevent fraudulent activity</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">4. Security of Data</h2>
            <p className="text-gray-700">
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">5. Changes to This Privacy Policy</h2>
            <p className="text-gray-700">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top.
            </p>
          </section>

          <section className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact William at: william.schlanbusch@gmail.com
            </p>
          </section>

          <section className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold mb-3">Cookie Consent</h3>
            <p className="text-gray-700 mb-4">
              By using our website, you consent to our use of cookies as described in this policy. You can withdraw consent at any time by updating your browser settings or clearing your cookies.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('cookie-consent');
                alert('Cookie consent reset. Please refresh the page.');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
              Reset Cookie Consent
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
