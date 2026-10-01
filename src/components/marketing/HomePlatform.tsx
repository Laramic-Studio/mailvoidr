import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { SheetKicker } from "@/components/marketing/SheetKicker";
import {
  HOME_BENTO,
  HOME_CHART_PREVIEW,
  HOME_PLATFORM,
  mailSendUrl,
} from "@/content/marketing/home";

export function HomePlatform() {
  const sendUrl = mailSendUrl();

  return (
    <section className="relative border-b border-border">
      <span className="page-frame-handle page-frame-handle-lg page-frame-handle-tl" aria-hidden />
      <span className="page-frame-handle page-frame-handle-lg page-frame-handle-tr" aria-hidden />
      <span className="page-frame-handle page-frame-handle-lg page-frame-handle-bl" aria-hidden />
      <span className="page-frame-handle page-frame-handle-lg page-frame-handle-br" aria-hidden />

      <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
        <div className="col-span-2 flex flex-col justify-center gap-3 bg-background px-6 py-10 md:px-8 md:py-12">
          <SheetKicker>Platform</SheetKicker>
          <h2 className="max-w-sm text-2xl font-medium leading-snug tracking-tight md:text-3xl">
            Send. Test. Observe.
          </h2>
          <p className="max-w-sm text-[13px] leading-relaxed text-muted-foreground">
            One workspace. Not three tools glued together.
          </p>
        </div>

        <div className="col-span-2 flex min-h-[220px] flex-col justify-center bg-background px-6 py-8 md:px-8">
          <p className="font-mono text-[13px] text-muted-foreground">
            {HOME_BENTO.send.title}
          </p>
          <SendPreview endpoint={sendUrl} />
        </div>

        <div className="flex min-h-[240px] flex-col bg-background px-6 py-8 md:px-8">
          <h3 className="text-lg font-medium tracking-tight md:text-xl">
            {HOME_BENTO.testing.title}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            {HOME_BENTO.testing.desc}
          </p>
          <TestPreview />
        </div>

        <div className="flex min-h-[240px] flex-col bg-background">
          <div className="px-6 py-8 md:px-8">
            <h3 className="text-lg font-medium tracking-tight md:text-xl">
              {HOME_BENTO.inboxes.title}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {HOME_BENTO.inboxes.desc}
            </p>
          </div>
          <InboxPreview />
        </div>

        <div className="col-span-2 flex min-h-[240px] flex-col bg-background">
          <div className="px-6 py-8 md:px-8">
            <h3 className="text-lg font-medium tracking-tight md:text-xl">
              {HOME_BENTO.analytics.title}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {HOME_BENTO.analytics.desc}
            </p>
          </div>
          <AnalyticsPreview />
        </div>

        {HOME_PLATFORM.map((item, index) => (
          <div
            key={item.title}
            className="flex flex-col justify-center gap-3 bg-background px-6 py-8 md:px-8"
          >
            <span className="font-mono text-2xl tabular-nums text-neutral-500 md:text-4xl">
              {String(index + 1).padStart(2, "0")}.
            </span>
            <p className="text-lg font-medium tracking-tight md:text-xl">
              {item.title}
            </p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SendPreview({ endpoint }: { endpoint: string }) {
  const path = endpoint.replace(/^https?:\/\/[^/]+/, "") || "/api/v1/mail/send";

  return (
    <div className="mt-6 font-code text-[12.5px] leading-[1.75]">
      <p className="text-muted-foreground">
        <span className="text-primary">POST</span> {path}
      </p>
      <p className="mt-3 text-muted-foreground">
        <span className="text-foreground/70">→</span> from hello@mail.yourdomain.com
      </p>
      <p className="text-muted-foreground">
        <span className="text-foreground/70">→</span> to riya@example.com
      </p>
      <p className="text-muted-foreground">
        <span className="text-foreground/70">→</span> subject Welcome to Acme
      </p>
      <p className="mt-3 text-primary">← 202 Accepted · status=queued</p>
    </div>
  );
}

function TestPreview() {
  return (
    <div className="mt-auto pt-8">
      <p className="font-mono text-5xl tabular-nums leading-none tracking-tight text-neutral-500 md:text-6xl">
        0.4
      </p>
      <p className="mt-2 font-mono text-[12px] text-muted-foreground">spam / 10</p>
      <ul className="mt-5 space-y-1 font-code text-[12.5px] text-muted-foreground">
        <li>DKIM pass</li>
        <li>SPF pass</li>
        <li>List-Unsubscribe set</li>
      </ul>
    </div>
  );
}

function InboxPreview() {
  const rows = [
    ["Stripe", "Receipt #4922"],
    ["GitHub", "New SSH key added"],
    ["Figma", "Comment on Dashboard v4"],
  ] as const;

  return (
    <ul className="mt-auto divide-y divide-border border-t border-border">
      {rows.map(([from, subject]) => (
        <li key={subject} className="px-6 py-3 md:px-8">
          <p className="text-sm font-medium tracking-tight">{from}</p>
          <p className="mt-0.5 font-code text-[12px] text-muted-foreground">
            {subject}
          </p>
        </li>
      ))}
    </ul>
  );
}

function AnalyticsPreview() {
  return (
    <div className="mt-auto h-36 px-2 pb-2 md:h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={HOME_CHART_PREVIEW} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="platform-sent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="sent"
            stroke="hsl(var(--primary))"
            fill="url(#platform-sent)"
            strokeWidth={1.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
