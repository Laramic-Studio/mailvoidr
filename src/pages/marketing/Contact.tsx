import { MarketingLayout } from "@/components/layouts/MarketingLayout";
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [sent, setSent] = useState(false);
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
                  [Mail, "sales@mailvoidr.io", "Sales & migrations"],
                  [MessageSquare, "support@mailvoidr.io", "Customer support"],
                  [Phone, "+1 (415) 555-0142", "Mon–Fri · 9–6 PT"],
                  [MapPin, "548 Market St · San Francisco · CA 94104", "HQ"],
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
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            data-testid="contact-form"
            className="border border-border bg-card p-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" name="first" defaultValue="" />
              <Field label="Last name" name="last" defaultValue="" />
            </div>
            <Field label="Work email" name="email" type="email" defaultValue="" />
            <Field label="Company" name="company" defaultValue="" />
            <div>
              <label className="label-mono block mb-1.5">Estimated volume</label>
              <select data-testid="contact-volume" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm">
                <option>&lt; 50k / month</option>
                <option>50k – 500k / month</option>
                <option>500k – 5M / month</option>
                <option>5M+ / month</option>
              </select>
            </div>
            <div>
              <label className="label-mono block mb-1.5">Message</label>
              <textarea data-testid="contact-message" rows={4} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Tell us about your stack and timeline…" />
            </div>
            <button data-testid="contact-submit" type="submit" className="w-full bg-primary text-primary-foreground rounded-md px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors">
              {sent ? "Message sent ✓" : "Send message"}
            </button>
            {sent && <p className="text-[12.5px] text-primary text-center">We'll be in touch within one business day.</p>}
          </form>
        </div>
      </section>
    </MarketingLayout>
  );
}

function Field({ label, name, type = "text", defaultValue }) {
  return (
    <div>
      <label className="label-mono block mb-1.5">{label}</label>
      <input data-testid={`contact-${name}`} type={type} defaultValue={defaultValue} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
    </div>
  );
}
