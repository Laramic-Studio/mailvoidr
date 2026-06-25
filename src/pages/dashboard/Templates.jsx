import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { TEMPLATES } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Search, Filter, FileCode2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Templates() {
  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Templates"
        title="Templates"
        description="Reusable email templates with variables, version history, and live previews."
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 border border-border bg-card rounded-md px-3 py-1.5 text-[13px] hover:bg-accent">
              <Filter className="h-3 w-3" /> Filter
            </button>
            <button data-testid="template-create" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-[13px] font-medium hover:bg-primary/90">
              <Plus className="h-3 w-3" /> New template
            </button>
          </>
        }
      />

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input data-testid="template-search" placeholder="Search templates…" className="w-full bg-card border border-border rounded-md pl-8 pr-3 py-1.5 text-[13px]" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
        {TEMPLATES.map((t) => (
          <Link
            to={`/dashboard/templates/${t.id}`}
            key={t.id}
            data-testid={`template-card-${t.id}`}
            className="bg-card p-5 hover:bg-accent/30 transition-colors group flex flex-col"
          >
            <div className="flex items-start justify-between">
              <FileCode2 className="h-4 w-4 text-muted-foreground" />
              <StatusBadge status={t.category.toLowerCase() === "transactional" ? "active" : "info"} label={t.category} tone={t.category === "Marketing" ? "info" : "success"} />
            </div>
            <h3 className="mt-4 text-[14.5px] font-medium tracking-tight">{t.name}</h3>
            <div className="mt-1.5 text-[11.5px] text-muted-foreground font-mono">Updated {t.updated} · {t.versions} versions</div>
            <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3 text-[12px]">
              <div>
                <div className="label-mono">Sent · 30d</div>
                <div className="mt-1 font-mono">{t.sent.toLocaleString()}</div>
              </div>
              <div>
                <div className="label-mono">Open rate</div>
                <div className="mt-1 font-mono text-primary">{t.open}%</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
