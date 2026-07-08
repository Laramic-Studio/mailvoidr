export interface DashboardNavItem {
  to: string;
  label: string;
  end?: boolean;
}

export interface DashboardNavGroup {
  label: string;
  items: DashboardNavItem[];
}

export const DASHBOARD_NAV_GROUPS: DashboardNavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Overview', end: true },
      { to: '/dashboard/send', label: 'Email Sending' },
      { to: '/dashboard/inbox', label: 'Inbox' },
      { to: '/dashboard/virtual-emails', label: 'Virtual emails' },
    ],
  },
  {
    label: 'Operate',
    items: [
      { to: '/dashboard/domains', label: 'Domains' },
      { to: '/dashboard/ip-whitelist', label: 'IP whitelist' },
      { to: '/dashboard/analytics', label: 'Analytics' },
      { to: '/dashboard/logs', label: 'Email Logs' },
      { to: '/dashboard/templates', label: 'Templates' },
    ],
  },
  {
    label: 'Developer',
    items: [
      { to: '/dashboard/api-keys', label: 'API Keys' },
      { to: '/dashboard/smtp', label: 'SMTP' },
      { to: '/dashboard/webhooks', label: 'Webhooks' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/dashboard/teams', label: 'Team' },
      { to: '/dashboard/billing', label: 'Billing' },
      { to: '/dashboard/settings', label: 'Settings' },
    ],
  },
];

export function resolveDashboardBreadcrumb(pathname: string): { group: string; label: string } | null {
  for (const group of DASHBOARD_NAV_GROUPS) {
    for (const item of group.items) {
      const matches = item.end
        ? pathname === item.to
        : pathname === item.to || pathname.startsWith(`${item.to}/`);

      if (matches) {
        return { group: group.label, label: item.label };
      }
    }
  }

  return null;
}
