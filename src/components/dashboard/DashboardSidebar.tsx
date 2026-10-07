import { useMemo, useRef } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboardIcon } from "@/components/icons/layout-dashboard";
import { ClipboardList, Mails, Megaphone } from "lucide-react";
import { createNavIcon } from "@/components/icons/lucide-nav-icon";
import { InboxIcon } from "@/components/icons/inbox";
import { MailIcon } from "@/components/icons/mail";
import { GlobeIcon } from "@/components/icons/globe";
import { ShieldCheckIcon } from "@/components/icons/shield-check";
import { ChartColumnIncreasingIcon } from "@/components/icons/chart-column-increasing";
import { ListChecksIcon } from "@/components/icons/list-checks";
import { FileCodeIcon } from "@/components/icons/file-code";
import { KeyRoundIcon } from "@/components/icons/key-round";
import { ServerIcon } from "@/components/icons/server";
import { WebhookIcon } from "@/components/icons/webhook";
import { UsersIcon } from "@/components/icons/users";
import { CreditCardIcon } from "@/components/icons/credit-card";
import { SettingsIcon } from "@/components/icons/settings";
import type {
  AnimatedIcon,
  AnimatedIconHandle,
} from "@/components/icons/types";
import { WorkspaceSwitcher } from "@/components/dashboard/WorkspaceSwitcher";
import { SidebarThemeSwitcher } from "@/components/dashboard/SidebarThemeSwitcher";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlanFeature } from "@/hooks/useBilling";
import {
  SIDEBAR_EASE,
  SIDEBAR_TRANSITION_MS,
} from "@/components/dashboard/sidebar-constants";
import { cn } from "@/lib/utils";

type NavItemConfig = {
  to: string;
  icon: AnimatedIcon;
  label: string;
  end?: boolean;
  feature?: string;
};

const AudiencesIcon = createNavIcon(Mails);
const FormsIcon = createNavIcon(ClipboardList);
const CampaignsIcon = createNavIcon(Megaphone);

const NAV_GROUPS: { label: string; items: NavItemConfig[] }[] = [
  {
    label: "Workspace",
    items: [
      {
        to: "/dashboard",
        icon: LayoutDashboardIcon,
        label: "Overview",
        end: true,
      },
      { to: "/dashboard/inbox", icon: InboxIcon, label: "Inbox" },
      {
        to: "/dashboard/virtual-emails",
        icon: MailIcon,
        label: "Virtual emails",
      },
    ],
  },
  {
    label: "Newsletters",
    items: [
      { to: "/dashboard/audiences", icon: AudiencesIcon, label: "Audiences" },
      { to: "/dashboard/forms", icon: FormsIcon, label: "Forms" },
      { to: "/dashboard/campaigns", icon: CampaignsIcon, label: "Campaigns" },
    ],
  },
  {
    label: "Operate",
    items: [
      { to: "/dashboard/domains", icon: GlobeIcon, label: "Domains" },
      {
        to: "/dashboard/ip-whitelist",
        icon: ShieldCheckIcon,
        label: "IP whitelist",
      },
      {
        to: "/dashboard/analytics",
        icon: ChartColumnIncreasingIcon,
        label: "Analytics",
        feature: "analytics",
      },
      { to: "/dashboard/logs", icon: ListChecksIcon, label: "Email Logs" },
      {
        to: "/dashboard/templates",
        icon: FileCodeIcon,
        label: "Templates",
        feature: "templates",
      },
    ],
  },
  {
    label: "Developer",
    items: [
      { to: "/dashboard/api-keys", icon: KeyRoundIcon, label: "API Keys" },
      { to: "/dashboard/smtp", icon: ServerIcon, label: "SMTP" },
      {
        to: "/dashboard/webhooks",
        icon: WebhookIcon,
        label: "Webhooks",
        feature: "webhooks",
      },
    ],
  },
  {
    label: "Account",
    items: [
      { to: "/dashboard/teams", icon: UsersIcon, label: "Team" },
      { to: "/dashboard/billing", icon: CreditCardIcon, label: "Billing" },
      { to: "/dashboard/settings", icon: SettingsIcon, label: "Settings" },
    ],
  },
];

interface DashboardSidebarProps {
  expanded: boolean;
  onNavigate?: () => void;
  className?: string;
}

function NavItem({
  to,
  icon: Icon,
  label,
  end,
  badge,
  expanded,
  onNavigate,
}: {
  to: string;
  icon: AnimatedIcon;
  label: string;
  end?: boolean;
  badge?: string;
  expanded: boolean;
  onNavigate?: () => void;
}) {
  const iconRef = useRef<AnimatedIconHandle>(null);
  const link = (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      data-testid={`side-nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-md text-[13px] transition-colors",
          expanded
            ? "mx-2 h-9 gap-2 px-2 w-auto"
            : "h-9 w-9 justify-center mx-auto",
          isActive
            ? "bg-accent text-foreground font-medium"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        )
      }
    >
      <Icon ref={iconRef} size={16} className="shrink-0" />
      {expanded && (
        <>
          <span className="flex-1 min-w-0 truncate">{label}</span>
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
    <li className="flex justify-center w-full">
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
  className,
}: DashboardSidebarProps) {
  const hasAnalytics = usePlanFeature("analytics");
  const hasTemplates = usePlanFeature("templates");
  const hasWebhooks = usePlanFeature("webhooks");

  const featureFlags = useMemo(
    () => ({
      analytics: hasAnalytics,
      templates: hasTemplates,
      webhooks: hasWebhooks,
    }),
    [hasAnalytics, hasTemplates, hasWebhooks],
  );

  const groups = useMemo(
    () =>
      NAV_GROUPS.map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!item.feature) return true;
          return featureFlags[item.feature as keyof typeof featureFlags];
        }),
      })).filter((group) => group.items.length > 0),
    [featureFlags],
  );

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden",
        className,
      )}
      style={{ ["--sidebar-ease" as string]: SIDEBAR_EASE }}
    >
      {/* Workspace switcher */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center justify-center",
          expanded ? "px-2.5" : "px-0",
        )}
      >
        <WorkspaceSwitcher expanded={expanded} />
      </div>

      {/* Nav */}
      <nav className="flex-1 min-h-0 py-3 overflow-x-hidden overflow-y-auto scrollbar-none">
        <div className={expanded ? "space-y-5" : "space-y-3"}>
          {groups.map((group) => (
            <div key={group.label}>
              {/* Label animates in/out without layout jump */}
              <div
                className="px-4 overflow-hidden font-medium label-mono whitespace-nowrap"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  marginBottom: expanded ? 6 : 0,
                  opacity: expanded ? 1 : 0,
                  maxHeight: expanded ? 24 : 0,
                  transition: `opacity ${SIDEBAR_TRANSITION_MS}ms ${SIDEBAR_EASE}, max-height ${SIDEBAR_TRANSITION_MS}ms ${SIDEBAR_EASE}, margin-bottom ${SIDEBAR_TRANSITION_MS}ms ${SIDEBAR_EASE}`,
                }}
              >
                {group.label}
              </div>
              {/* ✅ Only center items when collapsed */}
              <ul
                className={cn(
                  "space-y-0.5",
                  !expanded && "flex flex-col items-center w-full",
                )}
              >
                {group.items.map((item) => (
                  <NavItem
                    key={item.to}
                    {...item}
                    expanded={expanded}
                    onNavigate={onNavigate}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer: theme switcher */}
      <div
        className={cn(
          "flex shrink-0 flex-col items-center gap-1 py-2.5",
          expanded ? "px-2.5" : "px-0",
        )}
      >
        <SidebarThemeSwitcher expanded={expanded} />
      </div>
    </div>
  );
}
