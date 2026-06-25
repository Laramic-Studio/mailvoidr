import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { TEMPLATES } from "@/lib/dummyData";
import { StatusBadge } from "@/components/StatusBadge";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TemplateDetail() {
  const { id } = useParams();
  const template = TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/dashboard/templates"
          className="text-muted-foreground hover:text-foreground"
          data-testid="template-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <PageHeader
          eyebrow="Templates"
          title={template.name}
          description={`Version history and preview for ${template.category} template.`}
        />
      </div>

      <div className="border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <StatusBadge status="active" label={template.category} />
          <span className="text-[13px] text-muted-foreground font-mono">
            {template.versions} versions · {template.sent} sent · {template.open}% open rate
          </span>
        </div>
        <p className="text-[13px] text-muted-foreground">
          Template editor and version history will connect in Module 16.
        </p>
      </div>
    </DashboardLayout>
  );
}
