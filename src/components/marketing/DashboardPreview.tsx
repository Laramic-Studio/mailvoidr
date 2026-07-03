import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { HOME_CHART_PREVIEW } from '@/content/marketing/home';

const DEMO_STATS = [
  { label: 'Emails sent', value: '12,847', delta: '+18.2%' },
  { label: 'Delivery rate', value: '99.4%', delta: '+0.3%' },
  { label: 'Opens', value: '4,291', delta: '+12.1%' },
  { label: 'Bounce rate', value: '0.6%', delta: '-0.1%' },
] as const;

const DEMO_LOGS = [
  { time: '14:32', recipient: 'riya@acme.com', template: 'welcome', status: 'delivered' },
  { time: '14:28', recipient: 'marcus@northline.io', template: 'reset-password', status: 'delivered' },
  { time: '14:15', recipient: 'sara@relay.dev', template: 'invoice', status: 'opened' },
] as const;

const DEMO_BREAKDOWN = [
  { label: 'Delivered', percent: 94, tone: 'primary' },
  { label: 'Opened', percent: 38, tone: 'blue' },
  { label: 'Bounced', percent: 1, tone: 'error' },
] as const;

function breakdownBarClass(tone: string): string {
  if (tone === 'primary') return 'bg-primary';
  if (tone === 'error') return 'bg-destructive';
  return 'bg-blue-500';
}

function statusClass(status: string): string {
  if (status === 'delivered') return 'text-primary';
  if (status === 'opened') return 'text-blue-500';
  return 'text-muted-foreground';
}

export function DashboardPreview() {
  const chartData = HOME_CHART_PREVIEW.map((point, index) => ({
    ...point,
    date: index % 2 === 0 ? `W${Math.floor(index / 2) + 1}` : '',
  }));

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/10 dark:shadow-black/50">
      <div className="grid gap-px border-b border-border bg-border md:grid-cols-4">
        {DEMO_STATS.map((stat) => (
          <div key={stat.label} className="bg-card p-4 md:p-5">
            <div className="label-mono">{stat.label}</div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <span className="text-xl font-medium tracking-tight md:text-2xl">{stat.value}</span>
              <span className="font-body text-[10.5px] text-primary">{stat.delta}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-px bg-border md:grid-cols-[2fr,1fr]">
        <div className="bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 md:px-5">
            <div>
              <h3 className="text-sm font-medium">Sending activity</h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Last 30d · 12,847 sent · 99.4% delivery</p>
            </div>
            <div className="hidden gap-1 font-body text-[10.5px] sm:flex">
              {['24h', '7d', '30d'].map((period, index) => (
                <span
                  key={period}
                  className={`rounded px-2 py-0.5 ${
                    index === 2 ? 'bg-accent text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {period}
                </span>
              ))}
            </div>
          </div>
          <div className="h-36 p-3 md:h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboard-preview-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={28}
                />
                <Area
                  type="monotone"
                  dataKey="sent"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  fill="url(#dashboard-preview-gradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card">
          <div className="border-b border-border px-4 py-3 md:px-5">
            <h3 className="text-sm font-medium">Delivery breakdown</h3>
          </div>
          <div className="space-y-3 p-4 md:p-5">
            {DEMO_BREAKDOWN.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-body">{item.percent}%</span>
                </div>
                <div className="mt-1 h-1 overflow-hidden bg-muted">
                  <div
                    className={`h-full ${breakdownBarClass(item.tone)}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card">
        <div className="border-b border-border px-4 py-3 md:px-5">
          <h3 className="text-sm font-medium">Recent email logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-[11.5px]">
            <thead>
              <tr className="border-b border-border">
                <th className="label-mono px-4 py-2 text-left md:px-5">Time</th>
                <th className="label-mono px-4 py-2 text-left md:px-5">Recipient</th>
                <th className="label-mono px-4 py-2 text-left md:px-5">Template</th>
                <th className="label-mono px-4 py-2 text-left md:px-5">Status</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_LOGS.map((entry) => (
                <tr key={entry.recipient} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-body text-muted-foreground md:px-5">{entry.time}</td>
                  <td className="px-4 py-2 md:px-5">{entry.recipient}</td>
                  <td className="px-4 py-2 font-body text-muted-foreground md:px-5">{entry.template}</td>
                  <td className={`px-4 py-2 font-body capitalize md:px-5 ${statusClass(entry.status)}`}>
                    {entry.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
