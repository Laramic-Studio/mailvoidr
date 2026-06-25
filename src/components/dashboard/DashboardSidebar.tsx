import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Send,
  Inbox,
  Mail,
  Globe,
  BarChart3,
  ListChecks,
  FileCode2,
  KeyRound,
  Server,
  Webhook,
  Users,
  CreditCard,
  Settings,
  BookOpen,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { WorkspaceSwitcher } from '@/components/dashboard/WorkspaceSwitcher';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';

const NAV_GROUPS = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
      { to: '/dashboard/send', icon: Send, label: 'Email Sending' },
      { to: '/dashboard/inbox', icon: Inbox, label: 'Inbox' },
      { to: '/dashboard/virtual-emails', icon: Mail, label: 'Virtual emails' },
    ],
  },
  {
    label: 'Operate',
    items: [
      { to: '/dashboard/domains', icon: Globe, label: 'Domains' },
      { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/dashboard/logs', icon: ListChecks, label: 'Email Logs' },
      { to: '/dashboard/templates', icon: FileCode2, label: 'Templates' },
    ],
  },
  {
    label: 'Developer',
    items: [
      { to: '/dashboard/api-keys', icon: KeyRound, label: 'API Keys' },
      { to: '/dashboard/smtp', icon: Server, label: 'SMTP' },
      { to: '/dashboard/webhooks', icon: Webhook, label: 'Webhooks' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/dashboard/teams', icon: Users, label: 'Team' },
      { to: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
      { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  onNavigate?: () => void;
  showCollapseToggle?: boolean;
  className?: string;
}

function NavItem({
  to,
  icon: Icon,
  label,
  end,
  badge,
  collapsed,
  onNavigate,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  end?: boolean;
  badge?: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const link = (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      data-testid={`side-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className={({ isActive }) =>
        cn(
          'flex items-center rounded-lg text-[13px] transition-colors',
          collapsed ? 'justify-center p-2.5' : 'justify-between gap-2 px-2.5 py-2',
          isActive
            ? 'bg-accent text-foreground font-medium'
            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
        )
      }
    >
      <span className={cn('flex items-center', collapsed ? '' : 'gap-2.5')}>
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && label}
      </span>
      {!collapsed && badge && (
        <span className="rounded border border-border px-1.5 font-mono text-[10px] text-muted-foreground">
          {badge}
        </span>
      )}
    </NavLink>
  );

  if (!collapsed) {
    return <li>{link}</li>;
  }

  return (
    <li>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </li>
  );
}

export function DashboardSidebar({
  collapsed,
  onNavigate,
  showCollapseToggle = true,
  className,
}: DashboardSidebarProps) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-border',
          collapsed ? 'justify-center px-2' : 'justify-between px-3',
        )}
      >
        <Logo small={collapsed} />

        {showCollapseToggle && !collapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            data-testid="sidebar-collapse"
            aria-label="Collapse sidebar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className={cn('shrink-0 border-b border-border bg-muted/20', collapsed ? 'px-2 py-2' : 'px-3 py-3')}>
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      <nav className="scrollbar-none flex-1 space-y-5 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="label-mono mb-1.5 px-2">{group.label}</div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.to} {...item} collapsed={collapsed} onNavigate={onNavigate} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className={cn('shrink-0 space-y-2 border-t border-border', collapsed ? 'p-2' : 'p-3')}>
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                to="/docs"
                data-testid="sidebar-docs-link"
                onClick={onNavigate}
                className="flex items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
              >
                <BookOpen className="h-4 w-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Documentation</TooltipContent>
          </Tooltip>
        ) : (
          <>
            <Link
              to="/docs"
              data-testid="sidebar-docs-link"
              onClick={onNavigate}
              className="flex items-center gap-2 px-1 py-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Documentation
            </Link>
            <div className="rounded-lg border border-border bg-background p-3">
              <div className="label-mono mb-1">Plan usage</div>
              <div className="flex items-center justify-between text-[12px]">
                <span>1.2M / 5M</span>
                <span className="font-mono text-muted-foreground">24%</span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden bg-muted">
                <div className="h-full bg-primary" style={{ width: '24%' }} />
              </div>
              <Link
                to="/dashboard/billing"
                onClick={onNavigate}
                className="mt-3 inline-flex items-center text-[11.5px] text-primary hover:underline"
              >
                Upgrade plan →
              </Link>
            </div>
          </>
        )}
      </div>

      {showCollapseToggle && collapsed && (
        <div className="shrink-0 border-t border-border p-2">
          <button
            type="button"
            onClick={toggleSidebar}
            data-testid="sidebar-expand"
            aria-label="Expand sidebar"
            className="flex w-full items-center justify-center rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}