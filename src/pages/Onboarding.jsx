import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CodeBlock } from "@/components/CodeBlock";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowRight, ArrowLeft, Code2, Building, Users, Rocket, Globe, Copy, Eye, EyeOff } from "lucide-react";

const STEPS = ["Welcome", "Workspace", "Usage", "Domain", "API key", "Done"];

const USE_CASES = [
  { id: "developer", icon: Code2, title: "Developer", desc: "Side projects and personal work." },
  { id: "startup", icon: Rocket, title: "Startup", desc: "1–50 people, shipping fast." },
  { id: "agency", icon: Users, title: "Agency", desc: "Multiple clients in one workspace." },
  { id: "enterprise", icon: Building, title: "Enterprise", desc: "50+ employees, compliance-heavy." },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [workspaceName, setWorkspaceName] = useState("Acme Inc.");
  const [useCase, setUseCase] = useState("startup");
  const [domain, setDomain] = useState("mail.acme.com");
  const [revealed, setRevealed] = useState(false);
  const nav = useNavigate();

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border px-6 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">Step {step + 1} / {STEPS.length}</span>
          <ThemeToggle />
        </div>
      </header>

      {/* Step rail */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`h-6 w-6 inline-flex items-center justify-center rounded-full text-[10px] font-mono ${
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-primary/20 text-primary border border-primary/40" :
                "bg-muted text-muted-foreground"
              }`}>
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={`text-[11.5px] ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-6 py-16">
        {step === 0 && (
          <div data-testid="onb-welcome">
            <span className="label-mono">Welcome</span>
            <h1 className="mt-2 text-4xl tracking-tight font-medium">Let's get you sending email.</h1>
            <p className="mt-3 text-muted-foreground">This will take about 4 minutes. We'll create your workspace, set up a domain, and generate your first API key.</p>
            <ul className="mt-8 space-y-3 text-sm">
              {[
                "Create a workspace for your team",
                "Verify a sending domain with SPF, DKIM, and DMARC",
                "Generate a scoped API key",
                "Send your first test email",
              ].map((s) => (
                <li key={s} className="flex items-center gap-2.5"><Check className="h-3.5 w-3.5 text-primary" /> {s}</li>
              ))}
            </ul>
          </div>
        )}

        {step === 1 && (
          <div data-testid="onb-workspace">
            <span className="label-mono">Step 2</span>
            <h1 className="mt-2 text-3xl tracking-tight font-medium">Create your workspace</h1>
            <p className="mt-2 text-muted-foreground text-sm">Your workspace is where your team will collaborate.</p>
            <div className="mt-8 space-y-4">
              <div>
                <label className="label-mono block mb-1.5">Workspace name</label>
                <input data-testid="onb-workspace-name" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="label-mono block mb-1.5">Workspace URL</label>
                <div className="flex items-center border border-border rounded-md bg-card overflow-hidden">
                  <span className="px-3 text-[12.5px] text-muted-foreground font-mono">mailvoidr.io/</span>
                  <input data-testid="onb-workspace-slug" defaultValue={workspaceName.toLowerCase().replace(/[^a-z]/g, "")} className="flex-1 bg-transparent py-2 pr-3 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="label-mono block mb-1.5">Region</label>
                <select data-testid="onb-region" className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm">
                  <option>us-east-1 · N. Virginia</option>
                  <option>eu-west-1 · Ireland</option>
                  <option>ap-south-1 · Mumbai</option>
                </select>
                <p className="mt-1.5 text-[11.5px] text-muted-foreground">Choose where your data lives. This can't be changed later.</p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div data-testid="onb-usage">
            <span className="label-mono">Step 3</span>
            <h1 className="mt-2 text-3xl tracking-tight font-medium">What best describes you?</h1>
            <p className="mt-2 text-muted-foreground text-sm">We'll customize your dashboard accordingly.</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {USE_CASES.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setUseCase(u.id)}
                  data-testid={`onb-usecase-${u.id}`}
                  className={`text-left border rounded-md p-4 transition-colors ${
                    useCase === u.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-accent/50"
                  }`}
                >
                  <u.icon className={`h-4 w-4 ${useCase === u.id ? "text-primary" : "text-muted-foreground"}`} />
                  <div className="mt-3 text-sm font-medium">{u.title}</div>
                  <div className="mt-0.5 text-[12.5px] text-muted-foreground">{u.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div data-testid="onb-domain">
            <span className="label-mono">Step 4</span>
            <h1 className="mt-2 text-3xl tracking-tight font-medium">Connect a sending domain</h1>
            <p className="mt-2 text-muted-foreground text-sm">We recommend a subdomain like <span className="font-mono text-foreground">mail.yourcompany.com</span>.</p>
            <div className="mt-8 space-y-4">
              <div>
                <label className="label-mono block mb-1.5">Domain</label>
                <input data-testid="onb-domain-input" value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="border border-border bg-card p-4">
                <div className="label-mono">DNS records to add</div>
                <div className="mt-3 space-y-2 font-mono text-[12px]">
                  {[
                    ["TXT", "@", "v=spf1 include:_spf.mailvoidr.io ~all"],
                    ["TXT", "mvdkim._domainkey", "v=DKIM1; k=rsa; p=MIGfMA0G..."],
                    ["CNAME", "track", "track.mailvoidr.io"],
                  ].map(([type, name, value]) => (
                    <div key={type} className="grid grid-cols-[60px_1fr] gap-3 items-center py-1.5 border-b border-border last:border-0">
                      <span className="text-primary">{type}</span>
                      <div className="text-muted-foreground truncate">{name} → <span className="text-foreground">{value}</span></div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11.5px] text-muted-foreground">DNS changes can take up to 30 minutes to propagate. You can skip and verify later.</p>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div data-testid="onb-apikey">
            <span className="label-mono">Step 5</span>
            <h1 className="mt-2 text-3xl tracking-tight font-medium">Generate your first API key</h1>
            <p className="mt-2 text-muted-foreground text-sm">Save this somewhere safe. You won't see it again.</p>
            <div className="mt-8 border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="label-mono">Production · web-app</span>
                <button onClick={() => setRevealed(!revealed)} className="font-mono text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                  {revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {revealed ? "Hide" : "Reveal"}
                </button>
              </div>
              <div className="mt-2 flex items-center gap-2 font-mono text-[13px] bg-background border border-border rounded px-3 py-2">
                <span className="flex-1 truncate" data-testid="onb-apikey-value">{revealed ? "mv_live_8k3xPa9LmQ2v7N4cT1bR5wY6sX0fE8aD" : "mv_live_8k3x••••••••••••••••••••••••"}</span>
                <button className="text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button>
              </div>
              <div className="mt-4">
                <CodeBlock language="bash" code={`export MAILVOIDR_API_KEY="mv_live_8k3xPa9LmQ2v7N4cT1bR5wY6sX0fE8aD"`} />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div data-testid="onb-done" className="text-center">
            <div className="h-14 w-14 rounded-full bg-primary/15 border border-primary/30 inline-flex items-center justify-center mb-6">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl tracking-tight font-medium">You're all set, Riya!</h1>
            <p className="mt-3 text-muted-foreground">Your workspace is ready. Time to send your first email.</p>
            <div className="mt-8 grid sm:grid-cols-2 gap-3 text-left">
              <Link to="/dashboard/send" className="border border-border bg-card p-4 hover:bg-accent transition-colors">
                <div className="text-sm font-medium">Send a test email →</div>
                <div className="mt-1 text-[12.5px] text-muted-foreground">Try sending with your new API key.</div>
              </Link>
              <Link to="/docs/quickstart" className="border border-border bg-card p-4 hover:bg-accent transition-colors">
                <div className="text-sm font-medium">Read the quickstart →</div>
                <div className="mt-1 text-[12.5px] text-muted-foreground">5-minute integration guide.</div>
              </Link>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="mt-12 flex items-center justify-between">
          <button onClick={back} disabled={step === 0} data-testid="onb-back" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next} data-testid="onb-next" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90">
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button onClick={() => nav("/dashboard")} data-testid="onb-finish" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90">
              Go to dashboard <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
