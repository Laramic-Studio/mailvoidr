import { MarketingLayout } from "@/components/layouts/MarketingLayout";
import { STATUS_COMPONENTS, STATUS_INCIDENTS } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";

function tinyHistory() {
  return Array.from({ length: 90 }, () => Math.random() > 0.985 ? "warn" : "ok");
}

export default function Status() {
  const allOk = STATUS_COMPONENTS.every((c) => c.status === "operational");
  return (
    <MarketingLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <span className="label-mono">Status</span>
          <div className="mt-3 flex items-center gap-3">
            {allOk ? <CheckCircle2 className="h-7 w-7 text-primary" /> : <AlertTriangle className="h-7 w-7 text-amber-500" />}
            <h1 className="text-4xl tracking-tight font-medium">{allOk ? "All systems operational" : "Some systems experiencing issues"}</h1>
          </div>
          <p className="mt-3 text-muted-foreground">Live status from our infrastructure across every region. Updated every 30 seconds.</p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-12 space-y-10">
          <div className="border border-border bg-card divide-y divide-border">
            {STATUS_COMPONENTS.map((c) => (
              <div key={c.name} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[14px] font-medium">{c.name}</div>
                    <div className="label-mono mt-0.5">Uptime · last 90 days · {c.uptime}%</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-3 flex gap-[2px]">
                  {tinyHistory().map((s, i) => (
                    <div
                      key={i}
                      className={`h-7 flex-1 rounded-sm ${s === "ok" ? "bg-primary/70 hover:bg-primary" : "bg-amber-500/70 hover:bg-amber-500"} transition-colors`}
                      title={`Day -${89 - i}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-2xl tracking-tight font-medium">Past incidents</h2>
            <div className="mt-5 border border-border bg-card divide-y divide-border">
              {STATUS_INCIDENTS.map((i) => (
                <div key={i.id} className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[14px] font-medium">{i.title}</div>
                      <div className="mt-1 flex items-center gap-3 text-[12.5px] text-muted-foreground font-mono">
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{i.started}</span>
                        <span>→</span>
                        <span>{i.updated}</span>
                      </div>
                    </div>
                    <StatusBadge status={i.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
