import { HOME_SEND_FEATURES } from "@/content/marketing/home";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { HomeSendCode } from "@/components/marketing/HomeSendCode";

export function HomeSend() {
  const sendRevealRef = useScrollReveal();

  return (
    <section className="border-b border-border">
      <div ref={sendRevealRef} className="grid lg:grid-cols-2">
        <div
          data-reveal
          className="page-band border-b border-border py-10 lg:border-b-0 lg:border-r"
        >
          <HomeSendCode />
        </div>
        <div data-reveal className="page-band py-10">
          <p className="leading-relaxed text-muted-foreground">
            Create an API key, verify a domain, and send. Mailvoidr queues
            the message, relays over SMTP, records lifecycle events, and
            fires webhooks your app can trust.
          </p>
          <ol className="mt-8 divide-y divide-border border-y border-border">
            {HOME_SEND_FEATURES.map((feature, index) => (
              <li key={feature} className="flex items-start gap-4 py-4">
                <span className="w-8 shrink-0 font-mono text-[12px] text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-relaxed">{feature}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
