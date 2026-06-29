import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Send, Inbox, Mail, Globe, BarChart3,
  ListChecks, FileCode2, KeyRound, Server, Webhook, Shield,
  Users, CreditCard, Settings, PanelLeftClose, PanelLeft,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { WorkspaceSwitcher } from '@/components/dashboard/WorkspaceSwitcher';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUiStore } from '@/stores/ui-store';
import { SIDEBAR_EASE, SIDEBAR_TRANSITION_MS } from '@/components/dashboard/sidebar-constants';
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
      { to: '/dashboard/ip-whitelist', icon: Shield, label: 'IP whitelist' },
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
  expanded: boolean;
  onNavigate?: () => void;
  showCollapseToggle?: boolean;
  className?: string;
}

function NavItem({
  to, icon: Icon, label, end, badge, expanded, onNavigate,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  end?: boolean;
  badge?: string;
  expanded: boolean;
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
          'flex items-center rounded-md text-[13px] transition-colors',
          expanded
            ? 'mx-2 h-9 gap-2 px-2 w-auto'
            : 'h-9 w-9 justify-center mx-auto',
          isActive
            ? 'bg-accent text-foreground font-medium'
            : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {expanded && (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {badge && (
            <span className="shrink-0 rounded border border-border px-1.5 font-mono text-[10px] text-muted-foreground">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );

  if (expanded) return <li>{link}</li>;

  return (
    <li className="flex w-full justify-center">
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    </li>
  );
}

export function DashboardSidebar({
  expanded,
  onNavigate,
  showCollapseToggle = true,
  className,
}: DashboardSidebarProps) {
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <div
      className={cn('flex h-full min-h-0 w-full flex-col overflow-hidden', className)}
      style={{ ['--sidebar-ease' as string]: SIDEBAR_EASE }}
    >
      {/* Header */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-border',
          expanded ? 'justify-between px-2.5' : 'justify-center px-0',
        )}
      >
        <Logo small={!expanded} />
        {showCollapseToggle && expanded && (
          <button
            type="button"
            onClick={toggleSidebar}
            data-testid="sidebar-collapse"
            aria-label="Collapse sidebar"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Workspace switcher */}
      <div
        className={cn(
          'flex shrink-0 justify-center border-b border-border bg-muted/20 py-2',
          expanded ? 'px-2.5' : 'px-0',
        )}
      >
        <WorkspaceSwitcher expanded={expanded} />
      </div>

      {/* Nav */}
      <nav className="scrollbar-none min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2">
        <div className={cn('space-y-3', !expanded && 'space-y-2')}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {/* Label animates in/out without layout jump */}
              <div
                className="label-mono mb-1 px-4 overflow-hidden whitespace-nowrap"
                style={{
                  opacity: expanded ? 1 : 0,
                  maxHeight: expanded ? 24 : 0,
                  transition: `opacity ${SIDEBAR_TRANSITION_MS}ms ${SIDEBAR_EASE}, max-height ${SIDEBAR_TRANSITION_MS}ms ${SIDEBAR_EASE}`,
                }}
              >
                {group.label}
              </div>
              {/* ✅ Only center items when collapsed */}
              <ul className={cn(
                'space-y-0.5',
                !expanded && 'flex flex-col items-center w-full',
              )}>
                {group.items.map((item) => (
                  <NavItem key={item.to} {...item} expanded={expanded} onNavigate={onNavigate} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Expand toggle (collapsed) */}
      {showCollapseToggle && !expanded && (
        <div className="flex shrink-0 justify-center border-t border-border py-2">
          <button
            type="button"
            onClick={toggleSidebar}
            data-testid="sidebar-expand"
            aria-label="Expand sidebar"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}