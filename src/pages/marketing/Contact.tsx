import { MarketingLayout } from '@/components/layouts/MarketingLayout';
import { submitContactForm } from '@/lib/api/contact';
import { Mail, MessageSquare, Phone, MapPin } from 'lucide-react';
import { type FormEvent, useState } from 'react';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      await submitContactForm({
        first_name: String(formData.get('first') ?? ''),
        last_name: String(formData.get('last') ?? ''),
        email: String(formData.get('email') ?? ''),
        company: String(formData.get('company') ?? '') || undefined,
        volume: String(formData.get('volume') ?? '') || undefined,
        message: String(formData.get('message') ?? ''),
      });
      setSent(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send your message.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MarketingLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-20 grid lg:grid-cols-2 gap-12">
          <div>
            <span className="label-mono">Contact</span>
            <h1 className="mt-2 text-5xl tracking-tight font-medium leading-[1.05]">
              Let's talk shipping<br /> email at scale.
            </h1>
            <p className="mt-5 text-muted-foreground max-w-md">
              Migrating from SendGrid, Mailgun, or Postmark? Send us a note — we'll help you plan the cutover.
            </p>
            <div className="mt-10 space-y-5 text-[13.5px]">
              {(
                [
                  [Mail, 'sales@mailvoidr.io', 'Sales & migrations'],
                  [MessageSquare, 'support@mailvoidr.io', 'Customer support'],
                  [Phone, '+1 (415) 555-0142', 'Mon–Fri · 9–6 PT'],
                  [MapPin, '548 Market St · San Francisco · CA 94104', 'HQ'],
                ] as const
              ).map(([Icon, val, sub]) => (
                <div key={val} className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <div className="font-mono">{val}</div>
                    <div className="label-mono mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            data-testid="contact-form"
            className="border border-border bg-card p-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" name="first" required />
              <Field label="Last name" name="last" required />
            </div>
            <Field label="Work email" name="email" type="email" required />
            <Field label="Company" name="company" />
            <div>
              <label className="label-mono block mb-1.5">Estimated volume</label>
              <select
                name="volume"
                data-testid="contact-volume"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
                defaultValue="50k – 500k / month"
              >
                <option>&lt; 50k / month</option>
                <option>50k – 500k / month</option>
                <option>500k – 5M / month</option>
                <option>5M+ / month</option>
              </select>
            </div>
            <div>
              <label className="label-mono block mb-1.5">Message</label>
              <textarea
                name="message"
                data-testid="contact-message"
                rows={4}
                required
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Tell us about your stack and timeline…"
              />
            </div>
            <button
              data-testid="contact-submit"
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {sent && !submitting ? 'Message sent ✓' : submitting ? 'Sending…' : 'Send message'}
            </button>
            {sent ? (
              <p className="text-[12.5px] text-primary text-center">
                We'll be in touch within one business day.
              </p>
            ) : null}
            {error ? <p className="text-[12.5px] text-destructive text-center">{error}</p> : null}
          </form>
        </div>
      </section>
    </MarketingLayout>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="label-mono block mb-1.5">{label}</label>
      <input
        data-testid={`contact-${name}`}
        name={name}
        type={type}
        required={required}
        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}
