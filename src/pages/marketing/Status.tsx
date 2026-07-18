import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { MarketingLayout } from '@/components/layouts/MarketingLayout';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  STATUS_COMPONENTS,
  STATUS_FOOTNOTE,
  STATUS_HERO,
  STATUS_HISTORY_LABEL,
  STATUS_INCIDENTS,
} from '@/content/marketing/status';
import { useHealth } from '@/hooks/useHealth';
import { useMemo } from 'react';

type DayState = 'ok' | 'warn' | 'down';

function formatCheckedAt(ms: number | undefined): string {
  if (!ms) return 'Checking…';
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(ms));
}

/** One bar per day from the 1st of the previous calendar month through today. */
function dayRangeLastMonthToToday(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const days: Date[] = [];
  for (let cursor = new Date(start); cursor <= today; cursor.setDate(cursor.getDate() + 1)) {
    days.push(new Date(cursor));
  }
  return days;
}

function formatDayLabel(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function buildDayHistory(
  dayCount: number,
  monitored: boolean,
  apiHealthy: boolean | undefined,
  healthLoading: boolean,
): DayState[] {
  return Array.from({ length: dayCount }, (_, index) => {
    const isToday = index === dayCount - 1;
    if (!isToday || !monitored) {
      return 'ok';
    }
    if (healthLoading) {
      return 'warn';
    }
    if (apiHealthy === false) {
      return 'down';
    }
    return 'ok';
  });
}

function uptimePercent(history: DayState[]): string {
  if (history.length === 0) {
    return '100';
  }
  const okDays = history.filter((state) => state === 'ok').length;
  return ((okDays / history.length) * 100).toFixed(2);
}

function dayStateLabel(state: DayState): string {
  switch (state) {
    case 'warn':
      return 'Checking';
    case 'down':
      return 'Unreachable';
    default:
      return 'Operational';
  }
}

function StatusCandle({ date, state }: { date: Date; state: DayState }) {
  const label = formatDayLabel(date);

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <div
          className={`h-7 min-w-[3px] flex-1 cursor-default rounded-sm transition-colors ${candleClass(state)}`}
          aria-label={`${label} — ${dayStateLabel(state)}`}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="font-mono text-[11px]">
        {label}
        <span className="text-primary-foreground/80"> · {dayStateLabel(state)}</span>
      </TooltipContent>
    </Tooltip>
  );
}
function candleClass(state: DayState): string {
  switch (state) {
    case 'warn':
      return 'bg-amber-500/70 hover:bg-amber-500';
    case 'down':
      return 'bg-destructive/70 hover:bg-destructive';
    default:
      return 'bg-primary/70 hover:bg-primary';
  }
}

function componentStatus(
  component: (typeof STATUS_COMPONENTS)[number],
  apiHealthy: boolean | undefined,
  healthLoading: boolean,
): { status: string; label?: string } {
  if (!component.monitored) {
    return { status: 'operational' };
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
  const headline = apiDown ? 'API unreachable' : 'All systems operational';

  const days = useMemo(() => dayRangeLastMonthToToday(), []);

  return (
    <MarketingLayout>
      <TooltipProvider delayDuration={0} skipDelayDuration={0}>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-16">
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
              const history = buildDayHistory(
                days.length,
                component.monitored,
                apiHealthy,
                healthLoading,
              );
              const { status, label } = componentStatus(component, apiHealthy, healthLoading);

              return (
                <div
                  key={component.id}
                  data-testid={`status-component-${component.id}`}
                  className="p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[14px] font-medium">{component.name}</div>
                      <div className="label-mono mt-0.5">
                        {STATUS_HISTORY_LABEL} · {uptimePercent(history)}%
                      </div>
                      <div className="mt-0.5 text-[12.5px] text-muted-foreground">{component.desc}</div>
                    </div>
                    <StatusBadge status={status} label={label} />
                  </div>
                  <div className="mt-3 flex gap-[2px]">
                    {history.map((state, index) => {
                      const day = days[index];
                      if (!day) return null;
                      return <StatusCandle key={day.toISOString()} date={day} state={state} />;
                    })}
                  </div>
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
      </TooltipProvider>
    </MarketingLayout>
  );
}
