import { useMemo, useState, type ReactNode } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Calendar, Download, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { PageHeader } from '@/components/PageHeader';
import { downloadAnalyticsExport } from '@/lib/api/analytics';
import { toastError, toastSuccess } from '@/lib/toast';
import {
  useAnalyticsDomains,
  useAnalyticsEngagement,
  useAnalyticsOverview,
  useAnalyticsTemplates,
} from '@/hooks/useAnalytics';
import type { DashboardPeriod } from '@/types';

const TABS = ['Overview', 'Deliverability', 'Engagement', 'Domains', 'Templates', 'Reports'] as const;
type AnalyticsTab = (typeof TABS)[number];
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

function formatNumber(value: number): string {
  return value.toLocaleString();
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex h-full min-h-[12rem] items-center justify-center p-8 text-center text-[13px] text-muted-foreground">
      {message}
    </div>
  );
}

function SummaryGrid({ cards }: { cards: readonly [string, string][] }) {
  if (cards.length === 0) return null;

  return (
    <div
      className={`mb-6 grid grid-cols-2 gap-px border border-border bg-border ${
        cards.length >= 5 ? 'md:grid-cols-5' : cards.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'
      }`}
    >
      {cards.map(([label, value]) => (
        <div key={label} className="bg-card p-5">
          <div className="label-mono">{label}</div>
          <div className="mt-2 text-xl font-medium tracking-tight">{value}</div>
        </div>
      ))}
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="flex items-center justify-center border border-border bg-card p-16 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  );
}

function ErrorPanel() {
  return (
    <div className="border border-border bg-card p-8 text-[13px] text-destructive">
      Could not load analytics for this tab.
    </div>
  );
}

function VolumeDeliveryChart({ data }: { data: Array<{ date: string; sent: number; delivered: number }> }) {
  if (data.length === 0) {
    return <EmptyPanel message="No sends in this period yet." />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
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
  );
}

function BounceFailureChart({
  data,
}: {
  data: Array<{ date: string; bounced: number; failed: number }>;
}) {
  if (data.length === 0) {
    return <EmptyPanel message="No bounces recorded in this period." />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="bounced" fill="hsl(var(--destructive))" />
        <Bar dataKey="failed" fill="hsl(var(--chart-4))" />
      </BarChart>
    </ResponsiveContainer>
  );
}

function DeliveryRateChart({
  data,
}: {
  data: Array<{ date: string; delivery_rate: number }>;
}) {
  if (data.length === 0) {
    return <EmptyPanel message="No delivery data in this period." />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, 'Delivery rate']} />
        <Line type="monotone" dataKey="delivery_rate" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="h-72 p-3">{children}</div>
    </div>
  );
}

function DomainTable({ rows, limit }: { rows: NonNullable<ReturnType<typeof useAnalyticsDomains>['data']>['data']; limit?: number }) {
  const visible = limit ? rows.slice(0, limit) : rows;

  if (visible.length === 0) {
    return <EmptyPanel message="No domain sends in this period." />;
  }

  return (
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
        {visible.map((row) => (
          <tr key={row.domain} className="border-b border-border last:border-0">
            <td className="p-3 font-mono">{row.domain}</td>
            <td className="p-3 font-mono text-muted-foreground">{formatNumber(row.sent)}</td>
            <td className="p-3 font-mono text-primary">{row.delivered_rate}%</td>
            <td className="p-3 font-mono">{row.bounce_rate}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function TemplateTable({
  rows,
  limit,
}: {
  rows: NonNullable<ReturnType<typeof useAnalyticsTemplates>['data']>['data'];
  limit?: number;
}) {
  const visible = limit ? rows.slice(0, limit) : rows;

  if (visible.length === 0) {
    return <EmptyPanel message="No template sends in this period." />;
  }

  return (
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
        {visible.map((row) => (
          <tr key={row.id} className="border-b border-border last:border-0">
            <td className="max-w-[260px] truncate p-3">{row.name}</td>
            <td className="p-3 font-mono text-muted-foreground">{formatNumber(row.sent)}</td>
            <td className="p-3 font-mono text-primary">{formatRate(row.open_rate)}</td>
            <td className="p-3 font-mono">{formatRate(row.click_rate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function EngagementPanel({
  data,
}: {
  data: NonNullable<ReturnType<typeof useAnalyticsEngagement>['data']>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <ChartCard title="Opens & clicks">
        {!data.available ? (
          <EmptyPanel message="Engagement data appears after recipients open or click tracked emails." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.engagement_chart}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="opens" fill="hsl(var(--primary))" />
              <Bar dataKey="clicks" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Devices & providers">
        <div className="grid h-full grid-cols-2">
          <div className="flex items-center justify-center">
            {data.devices.length === 0 ? (
              <p className="px-4 text-center text-[12px] text-muted-foreground">
                Device split needs open tracking data.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.devices} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                    {data.devices.map((_, index) => (
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
            {data.providers.length === 0 ? (
              <p className="text-[12px] text-muted-foreground">Provider mix is derived from recipient domains.</p>
            ) : (
              <ul className="space-y-1.5 text-[12px]">
                {data.providers.map((provider, index) => (
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
      </ChartCard>

      <div className="border border-border bg-card lg:col-span-2">
        <div className="border-b border-border p-4">
          <h3 className="text-sm font-medium">Geography</h3>
        </div>
        {!data.geography.available || data.geography.data.length === 0 ? (
          <EmptyPanel message="Geo data appears when open or click events include a resolvable IP address." />
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border">
                <th className="label-mono p-3 text-left">Country</th>
                <th className="label-mono p-3 text-left">Share</th>
                <th className="label-mono p-3 text-right">Events</th>
              </tr>
            </thead>
            <tbody>
              {data.geography.data.map((row) => (
                <tr key={row.code} className="border-b border-border last:border-0">
                  <td className="p-3">
                    <span className="font-mono text-[11px] text-muted-foreground">{row.code}</span>
                    <span className="ml-2">{row.country}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 max-w-[8rem] rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(row.pct, 100)}%` }}
                        />
                      </div>
                      <span className="font-mono text-muted-foreground">{row.pct}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono text-muted-foreground">{row.events}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [tab, setTab] = useState<AnalyticsTab>('Overview');
  const [period, setPeriod] = useState<DashboardPeriod>('30d');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [exporting, setExporting] = useState<'sends' | 'engagement' | null>(null);

  async function handleExport(type: 'sends' | 'engagement') {
    setExporting(type);
    try {
      await downloadAnalyticsExport(type, period);
      toastSuccess(type === 'sends' ? 'Sends CSV downloaded.' : 'Engagement CSV downloaded.');
    } catch (error) {
      toastError(error, 'Could not export CSV.');
    } finally {
      setExporting(null);
    }
  }

  const needsOverview = tab === 'Overview' || tab === 'Deliverability';
  const needsEngagement = tab === 'Overview' || tab === 'Engagement';
  const needsDomains = tab === 'Overview' || tab === 'Domains';
  const needsTemplates = tab === 'Overview' || tab === 'Templates';

  const overviewQuery = useAnalyticsOverview(period, needsOverview);
  const engagementQuery = useAnalyticsEngagement(period, needsEngagement);
  const domainsQuery = useAnalyticsDomains(period, needsDomains);
  const templatesQuery = useAnalyticsTemplates(period, needsTemplates);

  const activeQuery =
    tab === 'Reports'
      ? null
      : tab === 'Engagement'
        ? engagementQuery
        : tab === 'Domains'
          ? domainsQuery
          : tab === 'Templates'
            ? templatesQuery
            : overviewQuery;

  const deliveryRateChart = useMemo(() => {
    const points = overviewQuery.data?.volume_chart ?? [];
    return points.map((point) => ({
      date: point.date,
      delivery_rate: point.sent > 0 ? Math.round((point.delivered / point.sent) * 1000) / 10 : 0,
    }));
  }, [overviewQuery.data?.volume_chart]);

  const domainSummary = useMemo(() => {
    const rows = domainsQuery.data?.data ?? [];
    if (rows.length === 0) return null;

    const totalSent = rows.reduce((sum, row) => sum + row.sent, 0);
    const avgDelivery = rows.reduce((sum, row) => sum + row.delivered_rate, 0) / rows.length;
    const worstBounce = Math.max(...rows.map((row) => row.bounce_rate));

    return { domains: rows.length, totalSent, avgDelivery, worstBounce };
  }, [domainsQuery.data?.data]);

  const templateSummary = useMemo(() => {
    const rows = templatesQuery.data?.data ?? [];
    if (rows.length === 0) return null;

    const totalSent = rows.reduce((sum, row) => sum + row.sent, 0);
    const openRates = rows.map((row) => row.open_rate).filter((rate): rate is number => rate != null);
    const clickRates = rows.map((row) => row.click_rate).filter((rate): rate is number => rate != null);

    return {
      templates: rows.length,
      totalSent,
      bestOpen: openRates.length > 0 ? Math.max(...openRates) : null,
      bestClick: clickRates.length > 0 ? Math.max(...clickRates) : null,
    };
  }, [templatesQuery.data?.data]);

  const summaryCards = useMemo((): readonly [string, string][] => {
    if (tab === 'Overview' || tab === 'Deliverability') {
      const summary = overviewQuery.data?.summary;
      if (!summary) return [];

      if (tab === 'Deliverability') {
        return [
          ['Total sent', formatNumber(summary.total_sent)],
          ['Delivery rate', formatRate(summary.delivery_rate, '0%')],
          ['Bounce rate', formatRate(summary.bounce_rate, '0%')],
          ['Complaint rate', formatRate(summary.complaint_rate)],
        ];
      }

      return [
        ['Delivery rate', formatRate(summary.delivery_rate, '0%')],
        ['Open rate', formatRate(summary.open_rate)],
        ['Click rate', formatRate(summary.click_rate)],
        ['Bounce rate', formatRate(summary.bounce_rate, '0%')],
        ['Complaint rate', formatRate(summary.complaint_rate)],
      ];
    }

    if (tab === 'Engagement') {
      const summary = engagementQuery.data?.summary;
      if (!summary) return [];

      return [
        ['Open rate', formatRate(summary.open_rate)],
        ['Click rate', formatRate(summary.click_rate)],
        ['Unique opens', formatNumber(summary.opens)],
        ['Unique clicks', formatNumber(summary.clicks)],
      ];
    }

    if (tab === 'Domains') {
      if (!domainSummary) return [];

      return [
        ['Sending domains', formatNumber(domainSummary.domains)],
        ['Total sent', formatNumber(domainSummary.totalSent)],
        ['Avg delivery', formatRate(domainSummary.avgDelivery, '0%')],
        ['Highest bounce', formatRate(domainSummary.worstBounce, '0%')],
      ];
    }

    if (tab === 'Templates') {
      if (!templateSummary) return [];

      return [
        ['Templates used', formatNumber(templateSummary.templates)],
        ['Total sent', formatNumber(templateSummary.totalSent)],
        ['Best open rate', formatRate(templateSummary.bestOpen)],
        ['Best click rate', formatRate(templateSummary.bestClick)],
      ];
    }

    return [];
  }, [tab, overviewQuery.data?.summary, engagementQuery.data?.summary, domainSummary, templateSummary]);

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

      {tab === 'Reports' ? (
        <div className="max-w-xl space-y-6">
          <div className="border border-border bg-card p-6">
            <h3 className="text-base font-medium">CSV export</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Download sends or engagement events for the selected period (last {period}, up to 10,000 rows).
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="analytics-export-sends"
                disabled={exporting !== null}
                onClick={() => handleExport('sends')}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] hover:bg-accent disabled:opacity-60"
              >
                {exporting === 'sends' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                Export sends
              </button>
              <button
                type="button"
                data-testid="analytics-export-engagement"
                disabled={exporting !== null}
                onClick={() => handleExport('engagement')}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[13px] hover:bg-accent disabled:opacity-60"
              >
                {exporting === 'engagement' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                Export engagement
              </button>
            </div>
          </div>
          <div className="border border-dashed border-border bg-card/30 p-8 text-center">
            <h3 className="text-sm font-medium">Scheduled reports</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Automated digests by email are planned for a later release.
            </p>
          </div>
        </div>
      ) : activeQuery?.isLoading ? (
        <LoadingPanel />
      ) : activeQuery?.isError ? (
        <ErrorPanel />
      ) : (
        <>
          <SummaryGrid cards={summaryCards} />

          {tab === 'Overview' && overviewQuery.data ? (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Volume vs. delivery">
                  <VolumeDeliveryChart data={overviewQuery.data.volume_chart} />
                </ChartCard>
                <ChartCard title="Bounces & failures">
                  <BounceFailureChart data={overviewQuery.data.bounce_chart} />
                </ChartCard>
              </div>

              {engagementQuery.data ? (
                <div className="mt-6">
                  <EngagementPanel data={engagementQuery.data} />
                </div>
              ) : null}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="border border-border bg-card">
                  <div className="border-b border-border p-4">
                    <h3 className="text-sm font-medium">Top domains</h3>
                  </div>
                  <DomainTable rows={domainsQuery.data?.data ?? []} limit={5} />
                </div>
                <div className="border border-border bg-card">
                  <div className="border-b border-border p-4">
                    <h3 className="text-sm font-medium">Top templates</h3>
                  </div>
                  <TemplateTable rows={templatesQuery.data?.data ?? []} limit={5} />
                </div>
              </div>
            </>
          ) : null}

          {tab === 'Deliverability' && overviewQuery.data ? (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard title="Delivery rate trend">
                  <DeliveryRateChart data={deliveryRateChart} />
                </ChartCard>
                <ChartCard title="Bounces & failures">
                  <BounceFailureChart data={overviewQuery.data.bounce_chart} />
                </ChartCard>
              </div>
              <div className="mt-6">
                <ChartCard title="Volume vs. delivery">
                  <VolumeDeliveryChart data={overviewQuery.data.volume_chart} />
                </ChartCard>
              </div>
            </>
          ) : null}

          {tab === 'Engagement' && engagementQuery.data ? <EngagementPanel data={engagementQuery.data} /> : null}

          {tab === 'Domains' ? (
            <div className="border border-border bg-card">
              <DomainTable rows={domainsQuery.data?.data ?? []} />
            </div>
          ) : null}

          {tab === 'Templates' ? (
            <div className="border border-border bg-card">
              <TemplateTable rows={templatesQuery.data?.data ?? []} />
            </div>
          ) : null}
        </>
      )}
    </DashboardLayout>
  );
}
