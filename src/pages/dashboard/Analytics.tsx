import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { USAGE_CHART, GEO_BREAKDOWN, DEVICE_BREAKDOWN, PROVIDER_BREAKDOWN, TOP_TEMPLATES, TOP_DOMAINS } from "@/lib/dummyData";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { Download, Calendar } from "lucide-react";
import { useState } from "react";

const TABS = ["Overview", "Deliverability", "Engagement", "Domains", "Templates", "Reports"];
const tooltipStyle = { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 4, fontSize: 11, fontFamily: "Geist Mono", padding: "6px 10px" };
const PIE_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Analytics() {
  const [tab, setTab] = useState("Overview");
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Operate"
        title="Analytics"
        description="Deliverability, engagement, and provider intelligence — across every send."
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 border border-border bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-accent"><Calendar className="h-3 w-3" /> Last 30d</button>
            <button data-testid="analytics-export" className="inline-flex items-center gap-1.5 border border-border bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-accent"><Download className="h-3 w-3" /> Export CSV</button>
          </>
        }
      />

      <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} data-testid={`analytics-tab-${t.toLowerCase()}`} className={`px-3.5 py-2 text-[13px] whitespace-nowrap transition-colors ${tab === t ? "text-foreground border-b-2 border-primary -mb-px" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-px bg-border border border-border mb-6">
        {[
          ["Delivery rate", "99.42%"],
          ["Open rate", "42.18%"],
          ["Click rate", "7.84%"],
          ["Bounce rate", "0.32%"],
          ["Complaint rate", "0.04%"],
        ].map(([l, v]) => (
          <div key={l} className="bg-card p-5">
            <div className="label-mono">{l}</div>
            <div className="mt-2 text-xl font-medium tracking-tight">{v}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="border border-border bg-card">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-medium">Volume vs. delivery</h3>
          </div>
          <div className="p-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={USAGE_CHART}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="sent" stroke="hsl(var(--primary))" fill="url(#g1)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="delivered" stroke="hsl(var(--chart-2))" fill="url(#g2)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border bg-card">
          <div className="p-4 border-b border-border"><h3 className="text-sm font-medium">Bounces & complaints</h3></div>
          <div className="p-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={USAGE_CHART.slice(-14)}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="bounced" fill="hsl(var(--destructive))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border bg-card">
          <div className="p-4 border-b border-border"><h3 className="text-sm font-medium">Geography</h3></div>
          <div className="p-4">
            <ul className="space-y-3">
              {GEO_BREAKDOWN.map((g) => (
                <li key={g.code} className="text-[13px]">
                  <div className="flex items-center justify-between">
                    <span><span className="font-mono text-[11px] text-muted-foreground mr-2">{g.code}</span>{g.country}</span>
                    <span className="font-mono text-[12px]">{g.pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1 bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${g.pct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border border-border bg-card">
          <div className="p-4 border-b border-border"><h3 className="text-sm font-medium">Devices & providers</h3></div>
          <div className="p-3 grid grid-cols-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DEVICE_BREAKDOWN} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                  {DEVICE_BREAKDOWN.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="p-2">
              <div className="label-mono mb-2">Providers</div>
              <ul className="space-y-1.5 text-[12px]">
                {PROVIDER_BREAKDOWN.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="flex-1">{p.name}</span>
                    <span className="font-mono text-muted-foreground">{p.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Top tables */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="border border-border bg-card">
          <div className="p-4 border-b border-border"><h3 className="text-sm font-medium">Top templates</h3></div>
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border"><th className="text-left p-3 label-mono">Template</th><th className="text-left p-3 label-mono">Sent</th><th className="text-left p-3 label-mono">Open</th><th className="text-left p-3 label-mono">Click</th></tr></thead>
            <tbody>{TOP_TEMPLATES.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0"><td className="p-3 truncate max-w-[200px]">{t.name}</td><td className="p-3 font-mono text-muted-foreground">{t.sent.toLocaleString()}</td><td className="p-3 font-mono text-primary">{t.open}%</td><td className="p-3 font-mono">{t.click}%</td></tr>
            ))}</tbody>
          </table>
        </div>
        <div className="border border-border bg-card">
          <div className="p-4 border-b border-border"><h3 className="text-sm font-medium">Top domains</h3></div>
          <table className="w-full text-[13px]">
            <thead><tr className="border-b border-border"><th className="text-left p-3 label-mono">Domain</th><th className="text-left p-3 label-mono">Sent</th><th className="text-left p-3 label-mono">Delivered</th><th className="text-left p-3 label-mono">Rep.</th></tr></thead>
            <tbody>{TOP_DOMAINS.map((d) => (
              <tr key={d.domain} className="border-b border-border last:border-0"><td className="p-3 font-mono">{d.domain}</td><td className="p-3 font-mono text-muted-foreground">{d.sent.toLocaleString()}</td><td className="p-3 font-mono text-primary">{d.delivered}%</td><td className="p-3 font-mono">{d.reputation}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
