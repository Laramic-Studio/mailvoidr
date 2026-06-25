export function PageHeader({ title, description, actions, breadcrumbs, eyebrow }) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 mb-6">
      <div className="flex flex-col gap-1">
        {breadcrumbs && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-border">/</span>}
                <span className={i === breadcrumbs.length - 1 ? "text-foreground" : ""}>{b}</span>
              </span>
            ))}
          </div>
        )}
        {eyebrow && <span className="label-mono">{eyebrow}</span>}
      </div>
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
