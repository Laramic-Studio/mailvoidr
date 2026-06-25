import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Sparkline } from "@/components/Sparkline";

export function StatCard({ label, value, delta, trend = "up", series, testid }) {
  const positive = trend === "up";
  return (
    <div
      data-testid={testid || `stat-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className="group relative flex flex-col gap-3 border border-border bg-card p-5 transition-colors hover:bg-accent/40"
    >
      <div className="flex items-start justify-between">
        <span className="label-mono">{label}</span>
        {delta && (
          <span
            className={`inline-flex items-center gap-0.5 font-mono text-[11px] ${
              positive ? "text-primary" : "text-destructive"
            }`}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="font-medium text-2xl tracking-tight">{value}</span>
        {series && (
          <div className="h-9 w-20 opacity-80 group-hover:opacity-100 transition-opacity">
            <Sparkline data={series} positive={positive} />
          </div>
        )}
      </div>
    </div>
  );
}
