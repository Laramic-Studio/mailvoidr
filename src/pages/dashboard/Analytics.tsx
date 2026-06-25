import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Calendar, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import {
  useAnalyticsDomains,
  useAnalyticsEngagement,
  useAnalyticsOverview,
  useAnalyticsTemplates,
} from '@/hooks/useAnalytics';
import type { DashboardPeriod } from '@/types';

const TABS = ['Overview', 'Deliverability', 'Engagement', 'Domains', 'Templates', 'Reports'] as const;
const PERIODS: DashboardPeriod[] = ['24h', '7d', '30d', '90d'];

const tooltipStyle = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 4,
  fontSize: 11,
  fontFamily: 'Geist Mono',
  padding: '6px 10px',
};

const PIE_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function formatRate(value: number | null | undefined, fallback = '—'): string {
  if (value == null) return fallback;
  return `${value.toFixed(value >= 10 ? 1 : 2)}%`;
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[12rem] items-center justify-center p-8 text-center text-[13px] text-muted-foreground">
      {message}
    </div>
  );
}

export default function Analytics() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [periodOpen, setPeriodOpen] = useState(false);

  const overviewQuery = useAnalyticsOverview(period);
  const engagementQuery = useAnalyticsEngagement(period);
  const domainsQuery = useAnalyticsDomains(period);
  const templatesQuery = useAnalyticsTemplates(period);

  const isLoading =
    overviewQuery.isLoading ||
    engagementQuery.isLoading ||
    domainsQuery.isLoading ||
    templatesQuery.isLoading;

  const summaryCards = useMemo(() => {
    const summary = overviewQuery.data?.summary;
    if (!summary) return [];

    return [
      ['Delivery rate', formatRate(summary.delivery_rate, '0%')],
      ['Open rate', formatRate(summary.open_rate)],
      ['Click rate', formatRate(summary.click_rate)],
      ['Bounce rate', formatRate(summary.bounce_rate, '0%')],
      ['Complaint rate', formatRate(summary.complaint_rate)],
    ] as const;
  }, [overviewQuery.data?.summary]);

  const showOverviewCharts = tab === 'Overview' || tab === 'Deliverability';
  const showEngagementCharts = tab === 'Overview' || tab === 'Engagement';
  const showDomainTables = tab === 'Overview' || tab === 'Domains';
  const showTemplateTables = tab === 'Overview' || tab === 'Templates';

  return (
    <DashboardLayout>
      <PageHeader
        eyebrow="Operate"
        title="Analytics"
        description="Deliverability, engagement, and provider intelligence — across every send."
        actions={
          <div className="relative">
            <button
              type="button"
              data-testid="analytics-period-toggle"
              onClick={() => setPeriodOpen((open) => !open)}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] hover:bg-accent"
            >
              <Calendar className="h-3 w-3" /> Last {period}
            </button>
            {periodOpen ? (
              <div className="absolute right-0 z-20 mt-1 min-w-[7rem] border border-border bg-card p-1 shadow-md">
                {PERIODS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    data-testid={`analytics-period-${item}`}
                    onClick={() => {
                      setPeriod(item);
                      setPeriodOpen(false);
                    }}
                    className={`block w-full rounded px-2 py-1.5 text-left text-[12px] ${
                      period === item ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/60'
                    }`}
                  >
                    Last {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        }
      />

      <div className="mb-6 flex items-center gap-1 overflow-x-auto border-b border-border">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            data-testid={`analytics-tab-${item.toLowerCase()}`}
            className={`whitespace-nowrap px-3.5 py-2 text-[13px] transition-colors ${
              tab === item
                ? '-mb-px border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center border border-border bg-card p-16 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : overviewQuery.isError ? (
        <div className="border border-border bg-card p-8 text-[13px] text-destructive">
          Could not load analytics.
        </div>
      ) : tab === 'Reports' ? (
        <div className="border border-dashed border-border bg-card/30 p-16 text-center">
          <h3 className="text-base font-medium">Scheduled reports</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            CSV exports and scheduled digests are planned for a later release.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-px border border-border bg-border md:grid-cols-5">
            {summaryCards.map(([label, value]) => (
              <div key={label} className="bg-card p-5">
                <div className="label-mono">{label}</div>
                <div className="mt-2 text-xl font-medium tracking-tight">{value}</div>
              </div>
            ))}
          </div>

          {showOverviewCharts ? (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="border border-border bg-card">
                <div className="border-b border-border p-4">
                  <h3 className="text-sm font-medium">Volume vs. delivery</h3>
                </div>
                <div className="h-72 p-3">
                  {(overviewQuery.data?.volume_chart.length ?? 0) === 0 ? (
                    <EmptyPanel message="No sends in this period yet." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={overviewQuery.data?.volume_chart ?? []}>
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Area type="monotone" dataKey="sent" stroke="hsl(var(--primary))" fill="url(#g1)" strokeWidth={1.5} />
                        <Area type="monotone" dataKey="delivered" stroke="hsl(var(--chart-2))" fill="url(#g2)" strokeWidth={1.5} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="border border-border bg-card">
                <div className="border-b border-border p-4">
                  <h3 className="text-sm font-medium">Bounces & failures</h3>
                </div>
                <div className="h-72 p-3">
                  {(overviewQuery.data?.bounce_chart.length ?? 0) === 0 ? (
                    <EmptyPanel message="No bounces recorded in this period." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overviewQuery.data?.bounce_chart ?? []}>
                        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="bounced" fill="hsl(var(--destructive))" />
                        <Bar dataKey="failed" fill="hsl(var(--chart-4))" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {showEngagementCharts ? (
            <div className={`grid gap-6 lg:grid-cols-2 ${showOverviewCharts ? 'mt-6' : ''}`}>
              <div className="border border-border bg-card">
                <div className="border-b border-border p-4">
                  <h3 className="text-sm font-medium">Opens & clicks</h3>
                </div>
                <div className="h-72 p-3">
                  {!engagementQuery.data?.available ? (
                    <EmptyPanel message="Engagement data appears after recipients open or click tracked emails." />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={engagementQuery.data.engagement_chart}>
                        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="opens" fill="hsl(var(--primary))" />
                        <Bar dataKey="clicks" fill="hsl(var(--chart-2))" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="border border-border bg-card">
                <div className="border-b border-border p-4">
                  <h3 className="text-sm font-medium">Devices & providers</h3>
                </div>
                <div className="grid h-72 grid-cols-2 p-3">
                  <div className="flex items-center justify-center">
                    {(engagementQuery.data?.devices.length ?? 0) === 0 ? (
                      <p className="px-4 text-center text-[12px] text-muted-foreground">Device split needs open tracking data.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={engagementQuery.data?.devices ?? []} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                            {(engagementQuery.data?.devices ?? []).map((_, index) => (
                              <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="label-mono mb-2">Recipient providers</div>
                    {(engagementQuery.data?.providers.length ?? 0) === 0 ? (
                      <p className="text-[12px] text-muted-foreground">Provider mix is derived from recipient domains.</p>
                    ) : (
                      <ul className="space-y-1.5 text-[12px]">
                        {(engagementQuery.data?.providers ?? []).map((provider, index) => (
                          <li key={provider.name} className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-sm"
                              style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                            />
                            <span className="flex-1">{provider.name}</span>
                            <span className="font-mono text-muted-foreground">{provider.value}%</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-border bg-card lg:col-span-2">
                <div className="border-b border-border p-4">
                  <h3 className="text-sm font-medium">Geography</h3>
                </div>
                <EmptyPanel message="Geo breakdown requires IP enrichment — not enabled in v1." />
              </div>
            </div>
          ) : null}

          {(showDomainTables || showTemplateTables) && tab === 'Overview' ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {showDomainTables ? (
                <div className="border border-border bg-card">
                  <div className="border-b border-border p-4">
                    <h3 className="text-sm font-medium">Top domains</h3>
                  </div>
                  {(domainsQuery.data?.data.length ?? 0) === 0 ? (
                    <EmptyPanel message="No domain sends in this period." />
                  ) : (
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="label-mono p-3 text-left">Domain</th>
                          <th className="label-mono p-3 text-left">Sent</th>
                          <th className="label-mono p-3 text-left">Delivered</th>
                          <th className="label-mono p-3 text-left">Bounce</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(domainsQuery.data?.data ?? []).slice(0, 5).map((row) => (
                          <tr key={row.domain} className="border-b border-border last:border-0">
                            <td className="p-3 font-mono">{row.domain}</td>
                            <td className="p-3 font-mono text-muted-foreground">{row.sent.toLocaleString()}</td>
                            <td className="p-3 font-mono text-primary">{row.delivered_rate}%</td>
                            <td className="p-3 font-mono">{row.bounce_rate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : null}

              {showTemplateTables ? (
                <div className="border border-border bg-card">
                  <div className="border-b border-border p-4">
                    <h3 className="text-sm font-medium">Top templates</h3>
                  </div>
                  {(templatesQuery.data?.data.length ?? 0) === 0 ? (
                    <EmptyPanel message="No template sends in this period." />
                  ) : (
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="label-mono p-3 text-left">Template</th>
                          <th className="label-mono p-3 text-left">Sent</th>
                          <th className="label-mono p-3 text-left">Open</th>
                          <th className="label-mono p-3 text-left">Click</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(templatesQuery.data?.data ?? []).slice(0, 5).map((row) => (
                          <tr key={row.id} className="border-b border-border last:border-0">
                            <td className="max-w-[200px] truncate p-3">{row.name}</td>
                            <td className="p-3 font-mono text-muted-foreground">{row.sent.toLocaleString()}</td>
                            <td className="p-3 font-mono text-primary">{formatRate(row.open_rate)}</td>
                            <td className="p-3 font-mono">{formatRate(row.click_rate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}

          {tab === 'Domains' && showDomainTables ? (
            <div className="border border-border bg-card">
              {(domainsQuery.data?.data.length ?? 0) === 0 ? (
                <EmptyPanel message="No domain sends in this period." />
              ) : (
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="label-mono p-3 text-left">Domain</th>
                      <th className="label-mono p-3 text-left">Sent</th>
                      <th className="label-mono p-3 text-left">Delivered</th>
                      <th className="label-mono p-3 text-left">Bounced</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(domainsQuery.data?.data ?? []).map((row) => (
                      <tr key={row.domain} className="border-b border-border last:border-0">
                        <td className="p-3 font-mono">{row.domain}</td>
                        <td className="p-3 font-mono text-muted-foreground">{row.sent.toLocaleString()}</td>
                        <td className="p-3 font-mono text-primary">{row.delivered_rate}%</td>
                        <td className="p-3 font-mono">{row.bounce_rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}

          {tab === 'Templates' && showTemplateTables ? (
            <div className="border border-border bg-card">
              {(templatesQuery.data?.data.length ?? 0) === 0 ? (
                <EmptyPanel message="No template sends in this period." />
              ) : (
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="label-mono p-3 text-left">Template</th>
                      <th className="label-mono p-3 text-left">Sent</th>
                      <th className="label-mono p-3 text-left">Open</th>
                      <th className="label-mono p-3 text-left">Click</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(templatesQuery.data?.data ?? []).map((row) => (
                      <tr key={row.id} className="border-b border-border last:border-0">
                        <td className="max-w-[260px] truncate p-3">{row.name}</td>
                        <td className="p-3 font-mono text-muted-foreground">{row.sent.toLocaleString()}</td>
                        <td className="p-3 font-mono text-primary">{formatRate(row.open_rate)}</td>
                        <td className="p-3 font-mono">{formatRate(row.click_rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}
        </>
      )}
    </DashboardLayout>
  );
}
