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
    'We probe the public REST API from this page every 30 seconds. Other paths run on the same stack but are not individually checked yet.',
};

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
  'Historical uptime charts and per-region status pages are on the roadmap. For now, curl GET /api/v1/health on your deployment.';
