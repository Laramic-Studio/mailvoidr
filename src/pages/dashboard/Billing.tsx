import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { INVOICES, PLANS, USAGE_CHART } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { CreditCard, Download, ArrowUpRight, Check } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tooltipStyle = { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 4, fontSize: 11, fontFamily: "Geist Mono", padding: "6px 10px" };

export default function Billing() {
  const [tab, setTab] = useState("overview");
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Account"
        title="Billing"
        description="Plan, usage, invoices, and payment methods."
        actions={
          <button data-testid="billing-upgrade" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium hover:bg-primary/90">
            <ArrowUpRight className="h-3 w-3" /> Upgrade plan
          </button>
        }
      />

      <div className="flex items-center gap-1 border-b border-border mb-6">
        {[["overview", "Overview"], ["usage", "Usage"], ["invoices", "Invoices"], ["payment", "Payment methods"]].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} data-testid={`billing-tab-${id}`} className={`px-3.5 py-2 text-[13px] transition-colors ${tab === id ? "text-foreground border-b-2 border-primary -mb-px" : "text-muted-foreground hover:text-foreground"}`}>{l}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="label-mono">Current plan</span>
                <h3 className="mt-2 text-2xl tracking-tight font-medium">Scale</h3>
                <p className="text-[13px] text-muted-foreground mt-1">$199 / month · billed monthly · next bill Mar 1, 2026</p>
              </div>
              <StatusBadge status="active" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-px bg-border border border-border">
              {[["Email volume", "1.2M / 5M", 24], ["Domains", "8 / Unlimited", 0], ["Log retention", "90 days", 0]].map(([l, v, p]) => (
                <div key={l} className="bg-card p-4">
                  <div className="label-mono">{l}</div>
                  <div className="mt-1 font-mono text-sm">{v}</div>
                  {p > 0 && <div className="mt-2 h-1 bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${p}%` }} /></div>}
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <button className="border border-border bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-accent">Change plan</button>
              <button className="border border-destructive/30 text-destructive bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-destructive/10">Cancel subscription</button>
            </div>
          </div>
          <div className="border border-border bg-card p-5">
            <span className="label-mono">This month</span>
            <div className="mt-3 space-y-3 text-[13px]">
              <Row k="Base" v="$199.00" />
              <Row k="Additional emails" v="$0.00" />
              <Row k="Dedicated IP" v="$80.00" />
              <Row k="Inbound mail" v="$0.00" />
              <div className="h-px bg-border" />
              <Row k="Total" v="$279.00" strong />
            </div>
          </div>
        </div>
      )}

      {tab === "usage" && (
        <div className="border border-border bg-card">
          <div className="p-4 border-b border-border"><h3 className="text-sm font-medium">Email volume · last 30 days</h3></div>
          <div className="p-3 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={USAGE_CHART}>
                <defs><linearGradient id="b-g" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="sent" stroke="hsl(var(--primary))" fill="url(#b-g)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "invoices" && (
        <div className="border border-border bg-card">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 label-mono">Invoice</th>
                <th className="text-left p-3 label-mono">Period</th>
                <th className="text-left p-3 label-mono">Amount</th>
                <th className="text-left p-3 label-mono">Date</th>
                <th className="text-left p-3 label-mono">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((i) => (
                <tr key={i.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="p-3 font-mono">{i.number}</td>
                  <td className="p-3">{i.period}</td>
                  <td className="p-3 font-mono">${i.amount.toFixed(2)}</td>
                  <td className="p-3 font-mono text-muted-foreground">{i.date}</td>
                  <td className="p-3"><StatusBadge status={i.status} /></td>
                  <td className="p-3"><button data-testid={`invoice-download-${i.id}`} className="inline-flex items-center gap-1 text-[12px] hover:text-primary"><Download className="h-3 w-3" />PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "payment" && (
        <div className="space-y-4">
          <div className="border border-border bg-card p-5 flex items-center gap-4">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-[14px]">Visa ending in 4242</div>
              <div className="text-[11.5px] text-muted-foreground font-mono">Expires 04/2028 · default</div>
            </div>
            <button className="text-[12px] text-muted-foreground hover:text-foreground">Edit</button>
            <button className="text-[12px] text-destructive">Remove</button>
          </div>
          <button data-testid="add-payment" className="w-full border border-dashed border-border rounded-md px-4 py-4 text-[13px] text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors">+ Add payment method</button>
        </div>
      )}
    </DashboardLayout>
  );
}

function Row({ k, v, strong }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className={`font-mono ${strong ? "text-foreground" : ""}`}>{v}</span>
    </div>
  );
}
