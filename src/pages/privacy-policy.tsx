import PageShell from '../components/layout/PageShell';
import Card, { CardDescription, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString();

  return (
    <PageShell title="Privacy Policy & Cookie Policy" maxWidth="lg">
      <p className="-mt-4 mb-8 text-sm text-slate-400">Last updated: {lastUpdated}</p>

      <div className="grid gap-5">
        <Card padding="lg">
          <CardTitle className="text-xl">1. Overview</CardTitle>
          <CardDescription className="mt-3 leading-relaxed text-slate-300">
            MiddleMan (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;, or &quot;Company&quot;) operates
            the MiddleMan platform. This page informs you of our policies regarding the collection,
            use, and disclosure of personal data when you use our service and the choices you have
            associated with that data.
          </CardDescription>
        </Card>

        <Card padding="lg">
          <CardTitle className="text-xl">2. Cookie Policy</CardTitle>
          <div className="mt-3 space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              <strong className="text-white">What are Cookies?</strong>
              <br />
              Cookies are small text files that are stored on your device when you visit our website.
              They help us recognize you and remember your preferences.
            </p>
            <p>
              <strong className="text-white">Types of Cookies We Use:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-white">Essential Cookies:</strong> Required for
                authentication, security, and platform functionality.
              </li>
              <li>
                <strong className="text-white">Session Cookies:</strong> Used to maintain your login
                session and user preferences.
              </li>
              <li>
                <strong className="text-white">Analytics Cookies:</strong> Help us understand how
                you use our platform to improve your experience.
              </li>
              <li>
                <strong className="text-white">Preference Cookies:</strong> Remember your settings
                and preferences.
              </li>
            </ul>
            <p>
              <strong className="text-white">Your Cookie Choices:</strong>
              <br />
              You can control cookies through your browser settings. However, disabling essential
              cookies may limit your ability to use certain features of our service.
            </p>
          </div>
        </Card>

        <Card padding="lg">
          <CardTitle className="text-xl">3. Information Collection and Use</CardTitle>
          <div className="mt-3 space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              We collect information you provide directly (email, name, account credentials) and
              information collected automatically (IP address, browser type, pages visited).
            </p>
            <p>
              <strong className="text-white">We use this information to:</strong>
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
        </Card>

        <Card padding="lg">
          <CardTitle className="text-xl">4. Security of Data</CardTitle>
          <CardDescription className="mt-3 leading-relaxed text-slate-300">
            The security of your data is important to us but remember that no method of transmission
            over the Internet or method of electronic storage is 100% secure. While we strive to use
            commercially acceptable means to protect your personal data, we cannot guarantee its
            absolute security.
          </CardDescription>
        </Card>

        <Card padding="lg">
          <CardTitle className="text-xl">5. Changes to This Privacy Policy</CardTitle>
          <CardDescription className="mt-3 leading-relaxed text-slate-300">
            We may update our Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date
            at the top.
          </CardDescription>
        </Card>

        <Card padding="lg">
          <CardTitle className="text-xl">6. Contact Us</CardTitle>
          <CardDescription className="mt-3 leading-relaxed text-slate-300">
            If you have any questions about this Privacy Policy, please contact William at:{' '}
            <a href="mailto:william.schlanbusch@gmail.com" className="text-accent hover:underline">
              william.schlanbusch@gmail.com
            </a>
          </CardDescription>
        </Card>

        <Alert variant="info" title="Cookie Consent">
          <p className="mb-4">
            By using our website, you consent to our use of cookies as described in this policy. You
            can withdraw consent at any time by updating your browser settings or clearing your
            cookies.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              localStorage.removeItem('cookie-consent');
              alert('Cookie consent reset. Please refresh the page.');
            }}
          >
            Reset Cookie Consent
          </Button>
        </Alert>
      </div>
    </PageShell>
  );
}
