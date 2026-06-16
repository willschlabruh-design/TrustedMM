import { useState } from 'react';
import PageShell from '../components/layout/PageShell';
import Card, { CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

export default function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <PageShell
      title="Contact"
      description="For support or immediate help, reach out using the form below or email us directly."
      maxWidth="md"
    >
      <p className="-mt-4 mb-6 text-sm text-slate-400">
        Email{' '}
        <a href="mailto:william.schlanbusch@gmail.com" className="text-accent hover:underline">
          william.schlanbusch@gmail.com
        </a>{' '}
        or join our Discord community for faster responses.
      </p>
      {success && (
        <Alert variant="success" className="mb-6">
          Message sent — admins have been notified.
        </Alert>
      )}
      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
          <CardDescription>We typically respond within one business day.</CardDescription>
        </CardHeader>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitting(true);
            setSuccess(false);
            setError(null);
            const form = e.currentTarget;
            const email = (form.elements.namedItem('email') as HTMLInputElement).value;
            const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;
            const name = '';
            try {
              const r = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, message }),
              });
              if (r.ok) {
                setSuccess(true);
                form.reset();
              } else {
                const j = await r.json();
                setError(j.error || r.statusText);
              }
            } catch {
              setError('Network error');
            }
            setSubmitting(false);
          }}
        >
          <Input name="email" type="email" label="Your email" placeholder="you@example.com" required />
          <div className="space-y-1.5">
            <label htmlFor="message" className="block text-sm font-medium text-slate-200">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="How can we help?"
              rows={6}
              required
              className="app-input min-h-[8rem] resize-y"
            />
          </div>
          <Button type="submit" loading={submitting} disabled={submitting}>
            Send message
          </Button>
        </form>
      </Card>
    </PageShell>
  );
}
