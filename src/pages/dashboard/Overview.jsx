import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { OVERVIEW_STATS, USAGE_CHART, EMAIL_LOGS, TOP_DOMAINS, TOP_TEMPLATES, ACTIVITY_FEED } from "@/lib/dummyData";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";
import { Link } from "react-router-dom";
import { ArrowUpRight, RefreshCw, Send, Calendar, Globe, FileCode2, Webhook, Users, Sparkles, KeyRound, AlertTriangle } from "lucide-react";

const ACTIVITY_ICONS = {
  domain: Globe, api: KeyRound, template: FileCode2, webhook: Webhook, team: Users, alert: AlertTriangle, billing: Sparkles,
};

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 4,
  fontSize: 11,
  fontFamily: "Geist Mono",
  padding: "6px 10px",
};

export default function DashboardOverview() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Dashboard"
        title="Overview"
        description="Real-time view of your sending, deliverability, and platform usage across all domains."
        actions={
          <>
            <button data-testid="overview-refresh" className="inline-flex items-center gap-1.5 border border-border bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-accent">
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
            <Link to="/dashboard/send" data-testid="overview-send-btn" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium hover:bg-primary/90">
              <Send className="h-3 w-3" /> Send email
            </Link>
          </>
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
        {OVERVIEW_STATS.map((s) => (
          <StatCard key={s.key} label={s.label} value={s.value} delta={s.delta} trend={s.trend} series={s.series} testid={`overview-stat-${s.key}`} />
        ))}
      </div>

      {/* Charts row */}
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-border bg-card">
          <div className="flex items-start justify-between p-5 border-b border-border">
            <div>
              <h3 className="text-base font-medium">Sending activity</h3>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">Last 30 days · 1.2M sent · 99.42% delivery</p>
            </div>
            <div className="flex items-center gap-1 text-[11.5px] font-mono">
              {["24h", "7d", "30d", "90d"].map((p) => (
                <button key={p} className={`px-2 py-1 rounded ${p === "30d" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{p}</button>
              ))}
            </div>
          </div>
          <div className="p-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={USAGE_CHART} margin={{ left: 12, right: 12, top: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id="g-sent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="sent" stroke="hsl(var(--primary))" strokeWidth={1.5} fill="url(#g-sent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-border bg-card">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-medium">Delivery breakdown</h3>
            <span className="label-mono">24h</span>
          </div>
          <div className="p-5 space-y-4">
            {[
              ["Delivered", 99.4, "primary"],
              ["Opened", 42.18, "info"],
              ["Clicked", 7.84, "info"],
              ["Bounced", 0.32, "error"],
              ["Complained", 0.04, "error"],
            ].map(([label, val, tone]) => (
              <div key={label}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono">{val}%</span>
                </div>
                <div className="mt-1.5 h-1 bg-muted overflow-hidden">
                  <div className={`h-full ${tone === "primary" ? "bg-primary" : tone === "error" ? "bg-destructive" : "bg-blue-500"}`} style={{ width: `${Math.min(val, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables row */}
      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-border bg-card">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-medium">Recent email logs</h3>
            <Link to="/dashboard/logs" className="text-[12.5px] text-primary hover:underline inline-flex items-center gap-0.5">View all <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-5 label-mono">Time</th>
                  <th className="text-left py-2 px-5 label-mono">Recipient</th>
                  <th className="text-left py-2 px-5 label-mono">Template</th>
                  <th className="text-left py-2 px-5 label-mono">Status</th>
                </tr>
              </thead>
              <tbody>
                {EMAIL_LOGS.slice(0, 7).map((e) => (
                  <tr key={e.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                    <td className="py-2 px-5 font-mono text-muted-foreground">{new Date(e.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="py-2 px-5 font-mono">{e.recipient}</td>
                    <td className="py-2 px-5 text-muted-foreground">{e.template}</td>
                    <td className="py-2 px-5"><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border border-border bg-card">
          <div className="p-5 border-b border-border">
            <h3 className="text-base font-medium">Activity feed</h3>
          </div>
          <ul className="divide-y divide-border">
            {ACTIVITY_FEED.map((a) => {
              const Icon = ACTIVITY_ICONS[a.type] || Sparkles;
              return (
                <li key={a.id} className="p-4 flex items-start gap-3">
                  <div className="h-7 w-7 rounded-md border border-border bg-background inline-flex items-center justify-center">
                    <Icon className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px]">
                      <span className="text-foreground">{a.actor}</span>
                      <span className="text-muted-foreground"> {a.action} </span>
                      <span className="font-mono text-[12px]">{a.target}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{a.time}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Top domains + templates */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="border border-border bg-card">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-medium">Top domains</h3>
            <Link to="/dashboard/domains" className="text-[12.5px] text-primary hover:underline inline-flex items-center gap-0.5">All <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <table className="w-full text-[13px]">
            <tbody>
              {TOP_DOMAINS.map((d) => (
                <tr key={d.domain} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="py-2.5 px-5">{d.domain}</td>
                  <td className="py-2.5 px-5 text-muted-foreground font-mono">{d.sent.toLocaleString()}</td>
                  <td className="py-2.5 px-5 text-right font-mono"><span className="text-primary">{d.delivered}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border border-border bg-card">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-base font-medium">Top templates</h3>
            <Link to="/dashboard/templates" className="text-[12.5px] text-primary hover:underline inline-flex items-center gap-0.5">All <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <table className="w-full text-[13px]">
            <tbody>
              {TOP_TEMPLATES.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="py-2.5 px-5 truncate max-w-[200px]">{t.name}</td>
                  <td className="py-2.5 px-5 text-muted-foreground font-mono">{t.sent.toLocaleString()}</td>
                  <td className="py-2.5 px-5 text-right font-mono text-primary">{t.open}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
