import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumbs?: string[];
  eyebrow?: string;
}

export function PageHeader({ title, description, actions, breadcrumbs, eyebrow }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 mb-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-[28px] font-medium tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
