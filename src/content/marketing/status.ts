export type StatusComponentId = 'api' | 'dashboard' | 'sandbox-smtp' | 'live-smtp' | 'webhooks';

export interface StatusComponent {
  id: StatusComponentId;
  name: string;
  desc: string;
  /** When true, the SPA probes this component on load. */
  monitored: boolean;
}

export const STATUS_HERO = {
  subtitle:
    'Daily status from the start of last month through today. We probe the REST API live every 30 seconds — today\'s bar reflects that check; earlier days assume operational unless an incident is posted below.',
};

export const STATUS_HISTORY_LABEL = 'Uptime · last month to date';

export const STATUS_COMPONENTS: StatusComponent[] = [
  {
    id: 'api',
    name: 'REST API',
    desc: 'GET /api/v1/health — auth, sends, domains, webhooks',
    monitored: true,
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    desc: 'Signed-in SPA — compose, logs, analytics, settings',
    monitored: false,
  },
  {
    id: 'sandbox-smtp',
    name: 'Sandbox SMTP',
    desc: 'Capture test mail on port 2525 before live sending',
    monitored: false,
  },
  {
    id: 'live-smtp',
    name: 'Live SMTP',
    desc: 'Outbound relay on port 587 with workspace credentials',
    monitored: false,
  },
  {
    id: 'webhooks',
    name: 'Webhook delivery',
    desc: 'Signed POST callbacks for send and engagement events',
    monitored: false,
  },
];

export const STATUS_INCIDENTS = {
  title: 'Past incidents',
  empty: 'No incidents reported. When something breaks, we post updates here.',
};

export const STATUS_FOOTNOTE =
  'Bars show one day each from the 1st of the previous calendar month through today. Hover a bar for the date.';
