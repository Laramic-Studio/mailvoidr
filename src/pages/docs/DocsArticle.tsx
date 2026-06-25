import { DocsLayout } from "@/components/layouts/DocsLayout";
import { CodeBlock } from "@/components/CodeBlock";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { CODE_SAMPLES } from "@/lib/dummyData";
import { Info } from "lucide-react";

const LANGS = [
  { id: "send_node", label: "Node.js" },
  { id: "send_python", label: "Python" },
  { id: "send_curl", label: "cURL" },
  { id: "send_go", label: "Go" },
];

// Each slug has a customized version of similar content
const TOC = [
  { id: "intro", title: "Introduction" },
  { id: "install", title: "Install the SDK" },
  { id: "auth", title: "Authenticate" },
  { id: "send", title: "Send your first email" },
  { id: "response", title: "Inspect the response" },
  { id: "errors", title: "Handle errors" },
  { id: "next", title: "Next steps" },
];

export default function DocsArticle() {
  const { slug = "quickstart" } = useParams();
  const [lang, setLang] = useState("send_node");
  const title = slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

  return (
    <DocsLayout toc={TOC} title={title}>
      <article className="space-y-8">
        <header>
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Docs / {title}</div>
          <h1 className="mt-3 text-4xl tracking-tight font-medium leading-[1.05]">{title}</h1>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed max-w-2xl">
            A pragmatic, end-to-end guide. By the end you'll have sent a verified email from your own domain to a real recipient — with logs and webhooks wired up.
          </p>
        </header>

        <section id="intro">
          <h2 className="text-xl tracking-tight font-medium">Introduction</h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground leading-relaxed">
            Mailvoidr exposes a single HTTP API and an SMTP relay. Every send is signed (DKIM), authenticated (SPF), aligned (DMARC), and logged. You can mix and match SDKs across services.
          </p>
          <div className="mt-4 border border-primary/30 bg-primary/5 rounded-md p-4 flex items-start gap-3">
            <Info className="h-4 w-4 text-primary mt-0.5" />
            <div className="text-[13.5px]">
              <strong className="block">Heads up</strong>
              <span className="text-muted-foreground">You'll need a verified sending domain. If you haven't added one yet, <a className="text-primary hover:underline" href="/docs/verify-domain">start here</a>.</span>
            </div>
          </div>
        </section>

        <section id="install">
          <h2 className="text-xl tracking-tight font-medium">Install the SDK</h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground">Choose your language. We ship type-safe SDKs for Node, Python, Go, Ruby, PHP, and Rust.</p>
          <CodeBlock className="mt-4" language="bash" code={`npm install @mailvoidr/node
# or
pip install mailvoidr
# or
go get github.com/mailvoidr/go`} />
        </section>

        <section id="auth">
          <h2 className="text-xl tracking-tight font-medium">Authenticate</h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground">Every request is authenticated with a bearer token. <a className="text-primary hover:underline" href="/dashboard/api-keys">Create one in the dashboard</a>.</p>
          <CodeBlock className="mt-4" language="bash" code={`export MAILVOIDR_API_KEY="mv_live_8k3xPa9LmQ2v7N4cT1bR5wY6sX0fE8aD"`} />
        </section>

        <section id="send">
          <h2 className="text-xl tracking-tight font-medium">Send your first email</h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground">Pick a language. The payload shape is identical across SDKs.</p>
          <div className="mt-4 border border-border bg-card">
            <div className="flex items-center gap-1 border-b border-border px-2">
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  data-testid={`docs-lang-${l.label.toLowerCase()}`}
                  className={`px-3 py-2 text-[12.5px] font-mono transition-colors ${lang === l.id ? "text-foreground border-b-2 border-primary -mb-px" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <CodeBlock code={CODE_SAMPLES[lang]} language={lang.replace("send_", "")} />
          </div>
        </section>

        <section id="response">
          <h2 className="text-xl tracking-tight font-medium">Inspect the response</h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground">A successful send returns the message ID. Use this to look the send up in <a className="text-primary hover:underline" href="/dashboard/logs">Email logs</a>.</p>
          <CodeBlock className="mt-4" language="json" code={JSON.stringify({
            id: "msg_8K3xPa9LmQ2v7N4cT1b",
            from: "hello@mail.acme.com",
            to: ["riya@example.com"],
            subject: "Welcome to Acme",
            status: "queued",
            created: "2026-02-18T09:42:18.012Z"
          }, null, 2)} />
        </section>

        <section id="errors">
          <h2 className="text-xl tracking-tight font-medium">Handle errors</h2>
          <p className="mt-3 text-[14.5px] text-muted-foreground">All errors return a typed error object. Always check both HTTP status and the <code className="font-mono text-foreground">code</code> field.</p>
          <CodeBlock className="mt-4" language="json" code={JSON.stringify({
            error: { code: "domain_not_verified", message: "The sending domain mail.acme.com is not yet verified.", docs: "https://mailvoidr.io/docs/verify-domain" }
          }, null, 2)} />
        </section>

        <section id="next">
          <h2 className="text-xl tracking-tight font-medium">Next steps</h2>
          <ul className="mt-3 space-y-2 text-[14.5px]">
            <li>→ <a className="text-primary hover:underline" href="/docs/webhooks">Wire up webhooks for delivery events</a></li>
            <li>→ <a className="text-primary hover:underline" href="/docs/templates">Build reusable templates with variables</a></li>
            <li>→ <a className="text-primary hover:underline" href="/docs/temporary-inboxes">Use temporary inboxes in CI</a></li>
            <li>→ <a className="text-primary hover:underline" href="/docs/spf-dkim-dmarc">Tighten your DMARC policy</a></li>
          </ul>
        </section>
      </article>
    </DocsLayout>
  );
}
