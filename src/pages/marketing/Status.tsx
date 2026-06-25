import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { MarketingLayout } from '@/components/layouts/MarketingLayout';
import { StatusBadge } from '@/components/StatusBadge';
import {
  STATUS_COMPONENTS,
  STATUS_FOOTNOTE,
  STATUS_HERO,
  STATUS_INCIDENTS,
} from '@/content/marketing/status';
import { useHealth } from '@/hooks/useHealth';

function formatCheckedAt(ms: number | undefined): string {
  if (!ms) return 'Checking…';
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(ms));
}

function componentStatus(
  component: (typeof STATUS_COMPONENTS)[number],
  apiHealthy: boolean | undefined,
  healthLoading: boolean,
): { status: string; label?: string } {
  if (!component.monitored) {
    return { status: 'operational', label: 'Not probed' };
  }

  if (healthLoading) {
    return { status: 'pending', label: 'Checking…' };
  }

  if (apiHealthy) {
    return { status: 'operational' };
  }

  return { status: 'down', label: 'Unreachable' };
}

export default function Status() {
  const { data: apiHealthy, isLoading: healthLoading, dataUpdatedAt, isError } = useHealth();
  const apiDown = !healthLoading && (isError || apiHealthy === false);
  const headline = apiDown ? 'API unreachable' : 'All monitored systems operational';

  return (
    <MarketingLayout>
      <section className="border-b border-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <span className="label-mono">Status</span>
          <div className="mt-3 flex items-center gap-3">
            {apiDown ? (
              <AlertTriangle className="h-7 w-7 text-destructive" />
            ) : (
              <CheckCircle2 className="h-7 w-7 text-primary" />
            )}
            <h1 className="text-4xl font-medium tracking-tight">{headline}</h1>
          </div>
          <p className="mt-3 max-w-2xl text-muted-foreground">{STATUS_HERO.subtitle}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[12px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last API check · {formatCheckedAt(dataUpdatedAt)}
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl space-y-10 px-6 py-12">
          <div className="divide-y divide-border border border-border bg-card">
            {STATUS_COMPONENTS.map((component) => {
              const { status, label } = componentStatus(component, apiHealthy, healthLoading);

              return (
                <div
                  key={component.id}
                  data-testid={`status-component-${component.id}`}
                  className="flex items-start justify-between gap-4 p-5"
                >
                  <div>
                    <div className="text-[14px] font-medium">{component.name}</div>
                    <div className="mt-0.5 text-[12.5px] text-muted-foreground">{component.desc}</div>
                    {!component.monitored ? (
                      <div className="label-mono mt-1.5">Same deployment · not individually probed</div>
                    ) : null}
                  </div>
                  <StatusBadge status={status} label={label} />
                </div>
              );
            })}
          </div>

          <div>
            <h2 className="text-2xl font-medium tracking-tight">{STATUS_INCIDENTS.title}</h2>
            <div className="mt-5 border border-border bg-card p-6 text-sm text-muted-foreground">
              {STATUS_INCIDENTS.empty}
            </div>
          </div>

          <p className="text-[12.5px] leading-relaxed text-muted-foreground">{STATUS_FOOTNOTE}</p>
        </div>
      </section>
    </MarketingLayout>
  );
}
