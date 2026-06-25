// Mailvoidr dummy data — realistic seeds for charts, tables, logs.

export const WORKSPACES = [
  { id: "ws_01HRX...", name: "Acme Inc.", slug: "acme", plan: "Scale", region: "us-east-1", role: "Owner" },
  { id: "ws_01HSY...", name: "Northwind Labs", slug: "northwind", plan: "Pro", region: "eu-west-1", role: "Admin" },
  { id: "ws_01HTZ...", name: "Personal", slug: "personal", plan: "Free", region: "us-east-1", role: "Owner" },
];

export const USER = {
  name: "Riya Mehta",
  email: "riya@acme.com",
  avatar: "RM",
  role: "Owner",
};

export const OVERVIEW_STATS = [
  { key: "sent", label: "Emails sent today", value: "1,284,932", delta: "+12.4%", trend: "up", series: [120, 132, 101, 134, 90, 230, 210, 220, 280, 320, 360, 410] },
  { key: "delivery", label: "Delivery rate", value: "99.42%", delta: "+0.18%", trend: "up", series: [98.1, 98.4, 98.9, 99.0, 99.1, 99.3, 99.4, 99.5, 99.4, 99.42, 99.45, 99.42] },
  { key: "open", label: "Open rate", value: "42.18%", delta: "-1.2%", trend: "down", series: [44, 43, 42, 45, 44, 42, 41, 43, 42, 41, 42, 42.18] },
  { key: "click", label: "Click rate", value: "7.84%", delta: "+0.6%", trend: "up", series: [6.2, 6.4, 6.7, 6.9, 7.0, 7.1, 7.3, 7.4, 7.5, 7.7, 7.8, 7.84] },
  { key: "bounce", label: "Bounce rate", value: "0.32%", delta: "-0.04%", trend: "up", series: [0.5, 0.48, 0.45, 0.42, 0.4, 0.38, 0.36, 0.35, 0.34, 0.33, 0.32, 0.32] },
  { key: "domains", label: "Verified domains", value: "8", delta: "+1", trend: "up", series: [4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8] },
  { key: "inboxes", label: "Active inboxes", value: "126", delta: "+18", trend: "up", series: [60, 72, 81, 90, 95, 102, 110, 118, 120, 123, 125, 126] },
  { key: "api", label: "API requests / 24h", value: "9.2M", delta: "+22.1%", trend: "up", series: [4.1, 4.5, 5, 5.4, 6.1, 6.8, 7.3, 7.8, 8.2, 8.6, 9.0, 9.2] },
];

export const USAGE_CHART = Array.from({ length: 30 }, (_, i) => {
  const day = new Date();
  day.setDate(day.getDate() - (29 - i));
  const base = 38000 + Math.round(Math.sin(i / 3) * 8000) + i * 800;
  return {
    date: day.toISOString().slice(5, 10),
    sent: base + Math.round(Math.random() * 3000),
    delivered: base - 200 + Math.round(Math.random() * 800),
    bounced: 80 + Math.round(Math.random() * 60),
    opened: Math.round((base - 200) * 0.42),
    clicked: Math.round((base - 200) * 0.078),
  };
});

export const TOP_DOMAINS = [
  { domain: "mail.acme.com", sent: 482910, delivered: 99.6, reputation: "Excellent" },
  { domain: "notify.acme.com", sent: 281204, delivered: 99.2, reputation: "Excellent" },
  { domain: "tx.northwind.io", sent: 168322, delivered: 98.9, reputation: "Good" },
  { domain: "alerts.acme.com", sent: 92814, delivered: 99.4, reputation: "Excellent" },
  { domain: "marketing.acme.com", sent: 45102, delivered: 97.1, reputation: "Fair" },
];

export const TOP_TEMPLATES = [
  { id: "tpl_8d2a", name: "Welcome • Onboarding v3", sent: 184302, open: 68.2, click: 14.1 },
  { id: "tpl_3f91", name: "Password reset", sent: 142091, open: 92.4, click: 81.0 },
  { id: "tpl_2c11", name: "Invoice • Monthly receipt", sent: 98412, open: 76.1, click: 22.3 },
  { id: "tpl_7a40", name: "Magic link login", sent: 81204, open: 95.8, click: 88.2 },
  { id: "tpl_9e22", name: "Weekly digest", sent: 64210, open: 38.4, click: 6.9 },
];

const STATUSES = ["delivered", "opened", "clicked", "bounced", "deferred", "complained", "failed"];
const PROVIDERS = ["gmail.com", "outlook.com", "yahoo.com", "icloud.com", "proton.me", "fastmail.com", "hey.com"];
const FROM_DOMAINS = ["mail.acme.com", "notify.acme.com", "tx.northwind.io", "alerts.acme.com"];
const TEMPLATES_LIST = ["welcome-v3", "password-reset", "invoice-monthly", "magic-link", "weekly-digest", "abandoned-cart"];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pad(n, l = 2) { return String(n).padStart(l, "0"); }

export const EMAIL_LOGS = Array.from({ length: 80 }, (_, i) => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - i * 7 - Math.floor(Math.random() * 5));
  const status = i < 4 ? "delivered" : rand(STATUSES);
  const recipient = `${rand(["alex","sara","mike","priya","chen","yuki","leo","amir","noor","dev"])}.${rand(["lee","kumar","singh","chen","park","ali","gonzalez","schmidt"])}@${rand(PROVIDERS)}`;
  return {
    id: `msg_${Math.random().toString(36).slice(2, 12)}`,
    ts: now.toISOString(),
    recipient,
    domain: rand(FROM_DOMAINS),
    template: rand(TEMPLATES_LIST),
    status,
    ip: `${pad(Math.floor(Math.random() * 223) + 1)}.${pad(Math.floor(Math.random() * 254))}.${pad(Math.floor(Math.random() * 254))}.${pad(Math.floor(Math.random() * 254))}`,
    response: status === "delivered" ? "250 2.0.0 OK" : status === "bounced" ? "550 5.1.1 User unknown" : status === "deferred" ? "421 4.7.0 Try again later" : "250 2.0.0 OK",
    subject: rand(["Welcome to Acme — get started in 5 minutes", "Your invoice for January 2026", "Reset your password", "Magic sign-in link", "Your weekly digest is ready", "Action required: verify your email"]),
    size: `${Math.floor(Math.random() * 60) + 4}KB`,
    open: Math.random() > 0.5,
    click: Math.random() > 0.7,
  };
});

export const DOMAINS = [
  { id: "dom_1", name: "mail.acme.com", status: "verified", reputation: 98, sent: 482910, region: "us-east-1", added: "2025-08-12", spf: "pass", dkim: "pass", dmarc: "pass", mx: "pass" },
  { id: "dom_2", name: "notify.acme.com", status: "verified", reputation: 96, sent: 281204, region: "us-east-1", added: "2025-09-04", spf: "pass", dkim: "pass", dmarc: "pass", mx: "pass" },
  { id: "dom_3", name: "tx.northwind.io", status: "verified", reputation: 91, sent: 168322, region: "eu-west-1", added: "2025-10-19", spf: "pass", dkim: "pass", dmarc: "warn", mx: "pass" },
  { id: "dom_4", name: "alerts.acme.com", status: "verified", reputation: 99, sent: 92814, region: "us-east-1", added: "2025-11-02", spf: "pass", dkim: "pass", dmarc: "pass", mx: "pass" },
  { id: "dom_5", name: "marketing.acme.com", status: "warning", reputation: 74, sent: 45102, region: "us-east-1", added: "2026-01-08", spf: "pass", dkim: "warn", dmarc: "fail", mx: "pass" },
  { id: "dom_6", name: "staging.acme.dev", status: "pending", reputation: 0, sent: 0, region: "us-east-1", added: "2026-02-04", spf: "pending", dkim: "pending", dmarc: "pending", mx: "pending" },
];

export const DNS_RECORDS = [
  { type: "TXT", host: "@", value: "v=spf1 include:_spf.mailvoidr.io ~all", purpose: "SPF", status: "pass" },
  { type: "TXT", host: "mvdkim._domainkey", value: "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDQ8...", purpose: "DKIM", status: "pass" },
  { type: "TXT", host: "_dmarc", value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@acme.com; ruf=mailto:dmarc@acme.com; sp=quarantine; aspf=s; adkim=s;", purpose: "DMARC", status: "pass" },
  { type: "MX", host: "@", value: "10 mx1.mailvoidr.io", purpose: "MX (inbound)", status: "pass" },
  { type: "CNAME", host: "track", value: "track.mailvoidr.io", purpose: "Tracking", status: "pass" },
];

export const INBOXES = [
  { id: "inb_4a91", address: "user-4a91@inbox.mailvoidr.io", label: "QA — Signup flow", messages: 142, unread: 3, ttl: "7 days", created: "2026-02-11", forwarding: "qa@acme.com" },
  { id: "inb_9c20", address: "tester+staging@inbox.mailvoidr.io", label: "Staging webhooks", messages: 89, unread: 0, ttl: "Never", created: "2026-02-08", forwarding: null },
  { id: "inb_7d31", address: "demo-7d31@inbox.mailvoidr.io", label: "Demo recordings", messages: 22, unread: 7, ttl: "24 hours", created: "2026-02-14", forwarding: null },
  { id: "inb_2e08", address: "support-test@inbox.mailvoidr.io", label: "Support replies", messages: 312, unread: 18, ttl: "30 days", created: "2025-12-03", forwarding: "support-qa@acme.com" },
  { id: "inb_1f55", address: "marketing-blast@inbox.mailvoidr.io", label: "Marketing previews", messages: 56, unread: 0, ttl: "14 days", created: "2026-01-22", forwarding: null },
  { id: "inb_6g77", address: "billing-tx@inbox.mailvoidr.io", label: "Billing tests", messages: 201, unread: 2, ttl: "30 days", created: "2025-11-29", forwarding: "fin-qa@acme.com" },
];

export const INBOX_MESSAGES = [
  { id: "m_01", from: "no-reply@stripe.com", fromName: "Stripe", subject: "Your receipt from Acme Inc. #4922-2018", preview: "Thanks for your payment of $49.00. Your subscription is active.", time: "2 min ago", read: false, attachments: 1, html: true, score: 0.1 },
  { id: "m_02", from: "team@linear.app", fromName: "Linear", subject: "Riya invited you to the workspace 'acme'", preview: "Riya Mehta invited you to join their workspace. Click to accept.", time: "12 min ago", read: false, attachments: 0, html: true, score: 0.2 },
  { id: "m_03", from: "security@github.com", fromName: "GitHub", subject: "[GitHub] A new SSH key was added to your account", preview: "A new SSH public key was added to your account. If this was not you, please review.", time: "1 hr ago", read: true, attachments: 0, html: true, score: 0.0 },
  { id: "m_04", from: "alerts@datadoghq.com", fromName: "Datadog", subject: "Triggered: [P2] api.latency.p95 > 480ms on web-prod", preview: "Alert triggered at 14:02 UTC. Current value 512ms.", time: "3 hr ago", read: true, attachments: 0, html: false, score: 0.0 },
  { id: "m_05", from: "noreply@figma.com", fromName: "Figma", subject: "Comment on 'Mailvoidr · Dashboard v4'", preview: "Sara left a comment: 'Can we tighten the sidebar to 240px?'", time: "4 hr ago", read: true, attachments: 0, html: true, score: 0.1 },
  { id: "m_06", from: "marketing@notion.so", fromName: "Notion", subject: "New AI features that will change your workflow", preview: "We're excited to share a few updates from the Notion team.", time: "Yesterday", read: true, attachments: 0, html: true, score: 2.8 },
  { id: "m_07", from: "bounce@mailer-daemon.com", fromName: "Mail Delivery", subject: "Undelivered Mail Returned to Sender", preview: "Delivery to the following recipient failed permanently.", time: "Yesterday", read: true, attachments: 0, html: false, score: 0.0 },
  { id: "m_08", from: "team@vercel.com", fromName: "Vercel", subject: "Production deployment for acme-web succeeded", preview: "Deployment dpl_8H2... is ready at acme.com.", time: "2 days ago", read: true, attachments: 0, html: true, score: 0.0 },
];

export const INBOX_RAW = `Return-Path: <bounces+482910-9c20@mailvoidr.io>
Received: from mta-prod-3.mailvoidr.io (mta-prod-3.mailvoidr.io [10.20.4.31])
  by inbox.mailvoidr.io with ESMTPS id 4Gm9Hk2sJ8z3pQ1
  for <user-4a91@inbox.mailvoidr.io>; Wed, 18 Feb 2026 09:42:18 +0000 (UTC)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=stripe.com; s=mv1;
  h=from:to:subject:date:message-id; bh=47DEQpj8HBSa+/TImW+5JCeuQeRk;
  b=Dz7nM... (truncated)
From: "Stripe" <no-reply@stripe.com>
To: user-4a91@inbox.mailvoidr.io
Subject: Your receipt from Acme Inc. #4922-2018
Date: Wed, 18 Feb 2026 09:42:18 +0000
Message-ID: <01HRX9Y2K8.0001@mta-prod-3.mailvoidr.io>
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="_b3a8h2-PART"

--_b3a8h2-PART
Content-Type: text/plain; charset=utf-8

Thanks for your payment of $49.00. Your subscription is active.

--_b3a8h2-PART
Content-Type: text/html; charset=utf-8

<!doctype html><html>...</html>
--_b3a8h2-PART--`;

export const INBOX_HEADERS = [
  ["Return-Path", "<bounces+482910-9c20@mailvoidr.io>"],
  ["Received", "from mta-prod-3.mailvoidr.io by inbox.mailvoidr.io ESMTPS"],
  ["DKIM-Signature", "v=1; a=rsa-sha256; d=stripe.com; s=mv1"],
  ["From", "Stripe <no-reply@stripe.com>"],
  ["To", "user-4a91@inbox.mailvoidr.io"],
  ["Subject", "Your receipt from Acme Inc. #4922-2018"],
  ["Date", "Wed, 18 Feb 2026 09:42:18 +0000"],
  ["Message-ID", "<01HRX9Y2K8.0001@mta-prod-3.mailvoidr.io>"],
  ["MIME-Version", "1.0"],
  ["Content-Type", "multipart/alternative"],
  ["X-Spam-Score", "0.1"],
  ["X-Mailvoidr-Inbox", "inb_4a91"],
];

export const API_KEYS = [
  { id: "key_01", name: "Production · web-app", prefix: "mv_live_8k3", scopes: ["send.write", "logs.read", "domains.read"], created: "2025-08-12", lastUsed: "2 min ago", requests: "1.2M" },
  { id: "key_02", name: "Staging · ci-pipeline", prefix: "mv_test_2nL", scopes: ["send.write", "inboxes.write", "logs.read"], created: "2025-11-04", lastUsed: "18 min ago", requests: "284K" },
  { id: "key_03", name: "Mobile app", prefix: "mv_live_9d2", scopes: ["send.write", "templates.read"], created: "2026-01-12", lastUsed: "1 hr ago", requests: "618K" },
  { id: "key_04", name: "Analytics export", prefix: "mv_live_5pQ", scopes: ["analytics.read", "logs.read"], created: "2026-02-01", lastUsed: "Yesterday", requests: "12K" },
  { id: "key_05", name: "Legacy · cron job", prefix: "mv_live_1aB", scopes: ["send.write"], created: "2024-09-30", lastUsed: "12 days ago", requests: "92K", revoked: true },
];

export const SMTP_CREDS = [
  { id: "smtp_01", name: "Production SMTP", host: "smtp.mailvoidr.io", port: 587, username: "mv_live_8k3@smtp", region: "us-east-1", sent: "1.2M", status: "active" },
  { id: "smtp_02", name: "EU SMTP", host: "smtp.eu.mailvoidr.io", port: 587, username: "mv_live_eu1@smtp", region: "eu-west-1", sent: "284K", status: "active" },
  { id: "smtp_03", name: "Staging SMTP", host: "smtp.mailvoidr.io", port: 2525, username: "mv_test_2nL@smtp", region: "us-east-1", sent: "18K", status: "active" },
];

export const WEBHOOKS = [
  { id: "wh_01", url: "https://api.acme.com/webhooks/mailvoidr", events: ["email.delivered", "email.bounced", "email.opened", "email.clicked"], secret: "whsec_8K2...", status: "active", success: 99.8, lastDelivery: "2 sec ago" },
  { id: "wh_02", url: "https://hooks.zapier.com/hooks/catch/3492/abc...", events: ["email.complained", "email.bounced"], secret: "whsec_2nL...", status: "active", success: 100, lastDelivery: "4 min ago" },
  { id: "wh_03", url: "https://staging.acme.com/wh/mv", events: ["*"], secret: "whsec_9d2...", status: "paused", success: 81.4, lastDelivery: "Yesterday" },
];

export const WEBHOOK_LOGS = Array.from({ length: 12 }, (_, i) => ({
  id: `whd_${Math.random().toString(36).slice(2, 8)}`,
  ts: new Date(Date.now() - i * 1000 * 60 * 7).toISOString(),
  event: rand(["email.delivered", "email.opened", "email.clicked", "email.bounced", "email.complained"]),
  url: "https://api.acme.com/webhooks/mailvoidr",
  status: i === 4 ? 503 : i === 8 ? 408 : 200,
  duration: `${Math.floor(Math.random() * 800) + 40}ms`,
  attempts: i === 4 ? 3 : 1,
}));

export const TEMPLATES = [
  { id: "tpl_8d2a", name: "Welcome • Onboarding v3", category: "Transactional", updated: "2 days ago", versions: 12, sent: 184302, open: 68.2 },
  { id: "tpl_3f91", name: "Password reset", category: "Transactional", updated: "1 week ago", versions: 4, sent: 142091, open: 92.4 },
  { id: "tpl_2c11", name: "Invoice • Monthly receipt", category: "Transactional", updated: "3 days ago", versions: 7, sent: 98412, open: 76.1 },
  { id: "tpl_7a40", name: "Magic link login", category: "Transactional", updated: "5 hr ago", versions: 3, sent: 81204, open: 95.8 },
  { id: "tpl_9e22", name: "Weekly digest", category: "Marketing", updated: "Yesterday", versions: 9, sent: 64210, open: 38.4 },
  { id: "tpl_4b18", name: "Abandoned cart · 1h", category: "Marketing", updated: "4 days ago", versions: 6, sent: 41032, open: 24.1 },
];

export const TEAM = [
  { id: "u_01", name: "Riya Mehta", email: "riya@acme.com", role: "Owner", joined: "Aug 2025", lastActive: "Now", avatar: "RM" },
  { id: "u_02", name: "Sara Park", email: "sara@acme.com", role: "Admin", joined: "Sep 2025", lastActive: "2 min ago", avatar: "SP" },
  { id: "u_03", name: "Marcus Lee", email: "marcus@acme.com", role: "Developer", joined: "Oct 2025", lastActive: "1 hr ago", avatar: "ML" },
  { id: "u_04", name: "Priya Singh", email: "priya@acme.com", role: "Developer", joined: "Nov 2025", lastActive: "3 hr ago", avatar: "PS" },
  { id: "u_05", name: "Chen Wu", email: "chen@acme.com", role: "Billing Manager", joined: "Dec 2025", lastActive: "Yesterday", avatar: "CW" },
  { id: "u_06", name: "Noor Ali", email: "noor@acme.com", role: "Viewer", joined: "Jan 2026", lastActive: "4 days ago", avatar: "NA" },
];

export const INVITES = [
  { id: "inv_01", email: "dev1@acme.com", role: "Developer", sent: "2 days ago", expires: "5 days" },
  { id: "inv_02", email: "ops@northwind.io", role: "Viewer", sent: "Yesterday", expires: "6 days" },
];

export const INVOICES = [
  { id: "in_2026_02", number: "MVR-2026-0218", amount: 1284.00, status: "paid", date: "2026-02-01", period: "Feb 2026" },
  { id: "in_2026_01", number: "MVR-2026-0117", amount: 1192.40, status: "paid", date: "2026-01-01", period: "Jan 2026" },
  { id: "in_2025_12", number: "MVR-2025-1207", amount: 982.10, status: "paid", date: "2025-12-01", period: "Dec 2025" },
  { id: "in_2025_11", number: "MVR-2025-1119", amount: 1042.80, status: "paid", date: "2025-11-01", period: "Nov 2025" },
  { id: "in_2025_10", number: "MVR-2025-1021", amount: 894.20, status: "paid", date: "2025-10-01", period: "Oct 2025" },
];

export const PLANS = [
  {
    name: "Free", priceMonthly: 0, blurb: "For hobby projects and prototypes.",
    features: ["1,000 emails / month", "1 verified domain", "3 temporary inboxes", "7-day log retention", "Community support"],
  },
  {
    name: "Pro", priceMonthly: 35, blurb: "For growing teams shipping production traffic.", popular: true,
    features: ["50,000 emails / month", "10 verified domains", "100 temporary inboxes", "30-day log retention", "Email + chat support", "Webhooks + replay"],
  },
  {
    name: "Scale", priceMonthly: 199, blurb: "For high-volume senders with strict deliverability needs.",
    features: ["500,000 emails / month", "Unlimited domains", "Unlimited inboxes", "90-day log retention", "Dedicated IP option", "SAML SSO", "99.99% SLA"],
  },
  {
    name: "Enterprise", priceMonthly: null, blurb: "For regulated industries and very large senders.",
    features: ["Custom volume", "Multi-region routing", "Audit logs + SCIM", "Dedicated success engineer", "BAA / SOC2 reports", "Private SMTP cluster"],
  },
];

export const ACTIVITY_FEED = [
  { id: "a1", actor: "Sara Park", action: "added domain", target: "alerts.acme.com", time: "2 min ago", type: "domain" },
  { id: "a2", actor: "System", action: "rotated API key", target: "Production · web-app", time: "12 min ago", type: "api" },
  { id: "a3", actor: "Marcus Lee", action: "created template", target: "Magic link login", time: "1 hr ago", type: "template" },
  { id: "a4", actor: "System", action: "webhook delivered", target: "email.bounced → api.acme.com", time: "1 hr ago", type: "webhook" },
  { id: "a5", actor: "Priya Singh", action: "invited member", target: "dev1@acme.com", time: "2 hr ago", type: "team" },
  { id: "a6", actor: "System", action: "deliverability dropped", target: "marketing.acme.com → 97.1%", time: "3 hr ago", type: "alert" },
  { id: "a7", actor: "Riya Mehta", action: "upgraded plan", target: "Pro → Scale", time: "Yesterday", type: "billing" },
];

export const SPAM_REPORT = {
  score: 0.4,
  rating: "Excellent",
  rules: [
    { id: "DKIM_VALID", desc: "DKIM signature present and verified", points: -0.1, status: "pass" },
    { id: "SPF_PASS", desc: "SPF record passes from sender IP", points: -0.1, status: "pass" },
    { id: "DMARC_PASS", desc: "DMARC alignment", points: -0.1, status: "pass" },
    { id: "HTML_RATIO", desc: "HTML to text ratio within acceptable range", points: 0.1, status: "warn" },
    { id: "ALL_CAPS", desc: "No excessive uppercase in subject", points: 0.0, status: "pass" },
    { id: "URL_SHORTENER", desc: "No URL shorteners detected", points: 0.0, status: "pass" },
    { id: "MISSING_UNSUBSCRIBE", desc: "List-Unsubscribe header present", points: -0.2, status: "pass" },
  ],
};

export const DOCS_NAV = [
  {
    section: "Getting Started",
    items: [
      { slug: "introduction", title: "Introduction" },
      { slug: "quickstart", title: "Quickstart" },
      { slug: "authentication", title: "Authentication" },
      { slug: "regions", title: "Regions & data residency" },
    ],
  },
  {
    section: "Sending Email",
    items: [
      { slug: "send-first-email", title: "Send your first email" },
      { slug: "templates", title: "Templates" },
      { slug: "scheduling", title: "Scheduling" },
      { slug: "attachments", title: "Attachments" },
      { slug: "batching", title: "Batching" },
    ],
  },
  {
    section: "Testing & Inboxes",
    items: [
      { slug: "testing-overview", title: "Testing overview" },
      { slug: "temporary-inboxes", title: "Temporary inboxes" },
      { slug: "spam-checker", title: "Spam checker" },
    ],
  },
  {
    section: "Domains",
    items: [
      { slug: "verify-domain", title: "Verify a domain" },
      { slug: "spf-dkim-dmarc", title: "SPF, DKIM, DMARC" },
      { slug: "subdomains", title: "Subdomains" },
    ],
  },
  {
    section: "Developer",
    items: [
      { slug: "api-reference", title: "API reference" },
      { slug: "smtp", title: "SMTP" },
      { slug: "webhooks", title: "Webhooks" },
      { slug: "sdks", title: "SDKs" },
      { slug: "errors", title: "Errors & rate limits" },
    ],
  },
];

export const STATUS_COMPONENTS = [
  { name: "API · us-east-1", status: "operational", uptime: 99.998 },
  { name: "API · eu-west-1", status: "operational", uptime: 99.992 },
  { name: "SMTP · us-east-1", status: "operational", uptime: 99.994 },
  { name: "SMTP · eu-west-1", status: "degraded", uptime: 99.81 },
  { name: "Webhooks", status: "operational", uptime: 99.99 },
  { name: "Dashboard", status: "operational", uptime: 99.999 },
  { name: "Inbound Mail", status: "operational", uptime: 99.97 },
];

export const STATUS_INCIDENTS = [
  { id: "inc_03", title: "Elevated SMTP latency in eu-west-1", status: "monitoring", started: "12:14 UTC", updated: "12:42 UTC", severity: "minor" },
  { id: "inc_02", title: "Webhook deliveries delayed up to 30s", status: "resolved", started: "Feb 17, 09:12 UTC", updated: "Feb 17, 10:01 UTC", severity: "minor" },
  { id: "inc_01", title: "API 5xx errors in us-east-1", status: "resolved", started: "Feb 14, 22:01 UTC", updated: "Feb 14, 22:38 UTC", severity: "major" },
];

export const BLOG_POSTS = [
  { slug: "we-raised-series-b", title: "We raised our Series B to build the email infrastructure layer of the internet", excerpt: "Today, we're announcing $42M led by Greylock to expand Mailvoidr across regions and double down on deliverability research.", author: "Riya Mehta", role: "Co-founder, CEO", date: "Feb 12, 2026", read: "6 min", category: "Company" },
  { slug: "inbox-rotation", title: "Introducing inbox rotation for QA pipelines", excerpt: "Generate per-test temporary inboxes that auto-expire and auto-forward — without polluting your team's mail.", author: "Marcus Lee", role: "Engineering", date: "Feb 04, 2026", read: "4 min", category: "Product" },
  { slug: "deliverability-2026", title: "The state of deliverability in 2026", excerpt: "BIMI adoption, AMP for Email, and what Apple Mail's MPP-3 means for your open rate.", author: "Sara Park", role: "Deliverability", date: "Jan 22, 2026", read: "11 min", category: "Engineering" },
  { slug: "dmarc-policy-guide", title: "A pragmatic guide to ratcheting your DMARC policy", excerpt: "Moving from p=none to p=reject without breaking legitimate mail.", author: "Priya Singh", role: "Solutions", date: "Jan 09, 2026", read: "8 min", category: "Engineering" },
  { slug: "soc2-typeii", title: "Mailvoidr is SOC 2 Type II certified", excerpt: "Our annual SOC 2 audit completed with zero exceptions. Here's what that means for your team.", author: "Chen Wu", role: "Security", date: "Dec 18, 2025", read: "3 min", category: "Company" },
];

export const FEATURES_LIST = [
  { icon: "send", title: "Send", desc: "Transactional and bulk email with the lowest p99 latency in the category. Send via API, SMTP, or SDKs." },
  { icon: "flask-conical", title: "Test", desc: "Catch broken templates before customers do. Spam scoring, render previews, and HTML linting on every commit." },
  { icon: "inbox", title: "Temporary Inboxes", desc: "Spin up disposable inboxes from CI. Each test run gets a fresh inbox that auto-expires." },
  { icon: "shield-check", title: "Domains & Auth", desc: "One-click SPF, DKIM, and DMARC. Continuous monitoring of your alignment posture." },
  { icon: "line-chart", title: "Analytics", desc: "Open rates, click maps, bounce reasons, and provider breakdowns — all in real-time." },
  { icon: "webhook", title: "Webhooks", desc: "Signed, retried, and replayable. Inspect every payload from the dashboard." },
  { icon: "key-round", title: "API Keys", desc: "Scoped tokens, rotation, and per-key analytics. Revoke instantly." },
  { icon: "server", title: "SMTP", desc: "Drop-in SMTP relay with per-credential analytics. Switch from SendGrid in 10 minutes." },
  { icon: "users", title: "Teams", desc: "Granular roles, SSO, and SCIM provisioning on Scale and Enterprise." },
  { icon: "globe", title: "Multi-region", desc: "Route per-region with data residency for GDPR, India, and APAC." },
  { icon: "shield", title: "Compliance", desc: "SOC 2 Type II, ISO 27001, HIPAA BAA, and GDPR-ready." },
  { icon: "terminal", title: "Developer-first", desc: "TypeScript-first SDKs, OpenAPI spec, and a CLI that ships with replay." },
];

export const CODE_SAMPLES = {
  send_node: `import { Mailvoidr } from "@mailvoidr/node";

const mv = new Mailvoidr(process.env.MAILVOIDR_API_KEY);

await mv.emails.send({
  from: "Acme <hello@mail.acme.com>",
  to: "riya@example.com",
  subject: "Welcome to Acme",
  html: "<h1>Hey Riya 👋</h1><p>Glad you're here.</p>",
  tags: ["welcome", "onboarding-v3"],
});`,
  send_curl: `curl https://api.mailvoidr.io/v1/emails \\
  -X POST \\
  -H "Authorization: Bearer $MAILVOIDR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "Acme <hello@mail.acme.com>",
    "to": "riya@example.com",
    "subject": "Welcome to Acme",
    "html": "<h1>Hey Riya</h1>"
  }'`,
  send_python: `from mailvoidr import Mailvoidr

mv = Mailvoidr(api_key=os.environ["MAILVOIDR_API_KEY"])

mv.emails.send(
    from_="Acme <hello@mail.acme.com>",
    to="riya@example.com",
    subject="Welcome to Acme",
    html="<h1>Hey Riya</h1>",
    tags=["welcome", "onboarding-v3"],
)`,
  send_go: `client := mailvoidr.NewClient(os.Getenv("MAILVOIDR_API_KEY"))

_, err := client.Emails.Send(ctx, &mailvoidr.SendParams{
    From:    "Acme <hello@mail.acme.com>",
    To:      []string{"riya@example.com"},
    Subject: "Welcome to Acme",
    HTML:    "<h1>Hey Riya</h1>",
})`,
};

export const GEO_BREAKDOWN = [
  { country: "United States", code: "US", sent: 482910, pct: 48.2 },
  { country: "United Kingdom", code: "GB", sent: 182910, pct: 18.3 },
  { country: "Germany", code: "DE", sent: 94210, pct: 9.4 },
  { country: "India", code: "IN", sent: 82321, pct: 8.2 },
  { country: "Canada", code: "CA", sent: 61204, pct: 6.1 },
  { country: "Australia", code: "AU", sent: 31204, pct: 3.1 },
  { country: "Other", code: "XX", sent: 65410, pct: 6.7 },
];

export const DEVICE_BREAKDOWN = [
  { name: "Desktop", value: 51.2 },
  { name: "Mobile", value: 41.4 },
  { name: "Tablet", value: 4.8 },
  { name: "Other", value: 2.6 },
];

export const PROVIDER_BREAKDOWN = [
  { name: "Gmail", value: 48.1 },
  { name: "Outlook", value: 21.3 },
  { name: "Yahoo", value: 12.2 },
  { name: "Apple Mail", value: 9.8 },
  { name: "Other", value: 8.6 },
];

export const SCHEDULED_EMAILS = [
  { id: "sch_01", subject: "Welcome to Acme — get started in 5 minutes", recipients: 1, scheduledFor: "Today, 18:00 UTC", template: "welcome-v3", status: "scheduled" },
  { id: "sch_02", subject: "Your weekly digest is ready", recipients: 8421, scheduledFor: "Mon, 09:00 UTC", template: "weekly-digest", status: "scheduled" },
  { id: "sch_03", subject: "February product update", recipients: 14203, scheduledFor: "Feb 25, 14:00 UTC", template: "newsletter-feb", status: "scheduled" },
];

export const CAMPAIGNS = [
  { id: "cmp_01", name: "Product launch · v4", sent: 18421, delivered: 99.6, open: 42.1, click: 12.4, sentOn: "Feb 12, 2026", status: "complete" },
  { id: "cmp_02", name: "January digest", sent: 12309, delivered: 99.2, open: 38.4, click: 7.1, sentOn: "Jan 30, 2026", status: "complete" },
  { id: "cmp_03", name: "Holiday season campaign", sent: 24180, delivered: 99.8, open: 51.2, click: 18.2, sentOn: "Dec 18, 2025", status: "complete" },
  { id: "cmp_04", name: "Feature beta invite", sent: 1204, delivered: 99.9, open: 68.2, click: 32.1, sentOn: "Dec 02, 2025", status: "complete" },
];
