export function EmptyState({ icon: Icon, title, description, action, testid = "empty-state" }) {
  return (
    <div
      data-testid={testid}
      className="flex flex-col items-center justify-center text-center border border-dashed border-border bg-card/40 px-6 py-16"
    >
      {Icon && (
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center border border-border bg-card">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-base font-medium tracking-tight">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground max-w-md">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
