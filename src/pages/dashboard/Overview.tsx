import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  ArrowUpRight,
  FileCode2,
  Globe,
  KeyRound,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  Users,
  Webhook,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useDashboardOverview } from '@/hooks/useDashboard';
import type { DashboardPeriod } from '@/types';

const PERIODS: DashboardPeriod[] = ['24h', '7d', '30d', '90d'];

const ACTIVITY_ICONS = {
  domain: Globe,
  api: KeyRound,
  template: FileCode2,
  webhook: Webhook,
  team: Users,
  alert: AlertTriangle,
  billing: Sparkles,
};

const tooltipStyle = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 4,
  fontSize: 11,
  fontFamily: 'Geist Mono',
  padding: '6px 10px',
};

function formatRelativeTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return date.toLocaleDateString();
}

function breakdownBarClass(tone: string): string {
  if (tone === 'primary') return 'bg-primary';
  if (tone === 'error') return 'bg-destructive';
  return 'bg-blue-500';
}

export default function DashboardOverview() {
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const { data, isLoading, isError, refetch, isFetching } = useDashboardOverview(period);

  const chartSummary = useMemo(() => {
    if (!data) return '';
    const { total_sent, delivery_rate } = data.chart.summary;
    return `${total_sent.toLocaleString()} sent · ${delivery_rate.toFixed(1)}% delivery`;
  }, [data]);

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Dashboard"
        title="Overview"
        description="Real-time view of your sending, deliverability, and platform usage across all domains."
        actions={
          <>
            <button
              type="button"
              data-testid="overview-refresh"
              disabled={isFetching}
              onClick={() => refetch()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] hover:bg-accent disabled:opacity-60"
            >
              {isFetching ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
              Refresh
            </button>
            <Link
              to="/dashboard/send"
              data-testid="overview-send-btn"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-[13px] font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-3 w-3" /> Send email
            </Link>
          </>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center border border-border bg-card p-16 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : isError || !data ? (
        <div className="border border-border bg-card p-8 text-[13px] text-destructive">
          Could not load dashboard overview.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-4">
            {data.stats.map((stat) => (
              <StatCard
                key={stat.key}
                label={stat.label}
                value={stat.value}
                delta={stat.delta ?? undefined}
                trend={stat.trend}
                series={stat.series ?? undefined}
                testid={`overview-stat-${stat.key}`}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="border border-border bg-card lg:col-span-2">
              <div className="flex items-start justify-between border-b border-border p-5">
                <div>
                  <h3 className="text-base font-medium">Sending activity</h3>
                  <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                    {period === '24h' ? 'Last 24 hours' : `Last ${period}`} · {chartSummary}
                  </p>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11.5px]">
                  {PERIODS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      data-testid={`overview-period-${item}`}
                      onClick={() => setPeriod(item)}
                      className={`rounded px-2 py-1 ${
                        period === item
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-72 p-3">
                {data.chart.series.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-[13px] text-muted-foreground">
                    No sends in this period yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.chart.series} margin={{ left: 12, right: 12, top: 12, bottom: 0 }}>
                      <defs>
                        <linearGradient id="g-sent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area
                        type="monotone"
                        dataKey="sent"
                        stroke="hsl(var(--primary))"
                        strokeWidth={1.5}
                        fill="url(#g-sent)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-5">
                <h3 className="text-base font-medium">Delivery breakdown</h3>
                <span className="label-mono">{period}</span>
              </div>
              <div className="space-y-4 p-5">
                {data.delivery_breakdown.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">No delivery data yet.</p>
                ) : (
                  data.delivery_breakdown.map((item) => (
                    <div key={item.key}>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-mono">{item.percent}%</span>
                      </div>
                      <div className="mt-1.5 h-1 overflow-hidden bg-muted">
                        <div
                          className={`h-full ${breakdownBarClass(item.tone)}`}
                          style={{ width: `${Math.min(item.percent, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="border border-border bg-card lg:col-span-2">
              <div className="flex items-center justify-between border-b border-border p-5">
                <h3 className="text-base font-medium">Recent email logs</h3>
                <Link
                  to="/dashboard/logs"
                  className="inline-flex items-center gap-0.5 text-[12.5px] text-primary hover:underline"
                >
                  View all <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                {data.recent_sends.length === 0 ? (
                  <div className="p-8 text-center text-[13px] text-muted-foreground">
                    No outbound sends yet.
                  </div>
                ) : (
                  <table className="w-full text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="label-mono px-5 py-2 text-left">Time</th>
                        <th className="label-mono px-5 py-2 text-left">Recipient</th>
                        <th className="label-mono px-5 py-2 text-left">Template</th>
                        <th className="label-mono px-5 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_sends.map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-border last:border-0 hover:bg-accent/30"
                        >
                          <td className="px-5 py-2 font-mono text-muted-foreground">
                            {entry.created_at
                              ? new Date(entry.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </td>
                          <td className="px-5 py-2 font-mono">{entry.recipient ?? '—'}</td>
                          <td className="px-5 py-2 text-muted-foreground">{entry.template ?? '—'}</td>
                          <td className="px-5 py-2">
                            <StatusBadge status={entry.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="border border-border bg-card">
              <div className="border-b border-border p-5">
                <h3 className="text-base font-medium">Activity feed</h3>
              </div>
              {data.activity.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-muted-foreground">
                  Team and workspace activity will appear here.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {data.activity.map((item) => {
                    const Icon = ACTIVITY_ICONS[item.type as keyof typeof ACTIVITY_ICONS] || Sparkles;
                    return (
                      <li key={item.id} className="flex items-start gap-3 p-4">
                        <div className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background">
                          <Icon className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[12.5px]">{item.summary}</div>
                          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                            {item.actor} · {formatRelativeTime(item.occurred_at)}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-5">
                <h3 className="text-base font-medium">Top domains</h3>
                <Link
                  to="/dashboard/domains"
                  className="inline-flex items-center gap-0.5 text-[12.5px] text-primary hover:underline"
                >
                  All <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              {data.top_domains.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-muted-foreground">No domain sends yet.</div>
              ) : (
                <table className="w-full text-[13px]">
                  <tbody>
                    {data.top_domains.map((domain) => (
                      <tr
                        key={domain.domain}
                        className="border-b border-border last:border-0 hover:bg-accent/30"
                      >
                        <td className="px-5 py-2.5">{domain.domain}</td>
                        <td className="px-5 py-2.5 font-mono text-muted-foreground">
                          {domain.sent.toLocaleString()}
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono">
                          <span className="text-primary">{domain.delivered}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border p-5">
                <h3 className="text-base font-medium">Top templates</h3>
                <Link
                  to="/dashboard/templates"
                  className="inline-flex items-center gap-0.5 text-[12.5px] text-primary hover:underline"
                >
                  All <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              {data.top_templates.length === 0 ? (
                <div className="p-8 text-center text-[13px] text-muted-foreground">
                  Template sends will rank here.
                </div>
              ) : (
                <table className="w-full text-[13px]">
                  <tbody>
                    {data.top_templates.map((template) => (
                      <tr
                        key={template.id}
                        className="border-b border-border last:border-0 hover:bg-accent/30"
                      >
                        <td className="max-w-[200px] truncate px-5 py-2.5">{template.name}</td>
                        <td className="px-5 py-2.5 font-mono text-muted-foreground">
                          {template.sent.toLocaleString()}
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono text-primary">
                          {template.open != null ? `${template.open}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
