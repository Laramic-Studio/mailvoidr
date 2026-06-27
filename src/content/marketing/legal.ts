export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocumentContent {
  eyebrow: string;
  title: string;
  summary: string;
  lastUpdated: string;
  contactEmail: string;
  sections: LegalSection[];
}

export const LEGAL_CONTACT = {
  legal: "legal@mailvoidr.io",
  privacy: "privacy@mailvoidr.io",
  support: "support@mailvoidr.io",
} as const;

export const TERMS_OF_SERVICE: LegalDocumentContent = {
  eyebrow: "Legal",
  title: "Terms of Service",
  summary:
    "These terms govern your access to Mailvoidr — our email sending, testing, and observability platform. By creating an account or using the service, you agree to them.",
  lastUpdated: "June 26, 2026",
  contactEmail: LEGAL_CONTACT.legal,
  sections: [
    {
      id: "agreement",
      title: "1. Agreement",
      paragraphs: [
        "These Terms of Service (\"Terms\") are a binding agreement between you and Mailvoidr, Inc. (\"Mailvoidr,\" \"we,\" \"us\") governing use of the Mailvoidr website, dashboard, API, SMTP endpoints, and related services (collectively, the \"Service\").",
        "If you use the Service on behalf of a company or other entity, you represent that you have authority to bind that entity, and \"you\" refers to that entity.",
        "If you do not agree to these Terms, do not use the Service.",
      ],
    },
    {
      id: "service",
      title: "2. The Service",
      paragraphs: [
        "Mailvoidr provides developer-focused email infrastructure, including production sending over HTTP and SMTP, sandbox capture for testing, virtual inboxes, domain verification, delivery logs, analytics, templates, webhooks, team workspaces, and related features.",
        "We may add, change, or remove features at any time. Plan limits, retention windows, and feature availability are described on our pricing page and in your workspace settings.",
        "The Service is not intended for consumers sending personal correspondence. It is built for software teams integrating email into applications and workflows.",
      ],
    },
    {
      id: "accounts",
      title: "3. Accounts & security",
      paragraphs: [
        "You must provide accurate registration information and keep your credentials, API keys, and SMTP passwords confidential. You are responsible for all activity under your account and workspace.",
        "You must be at least 18 years old (or the age of majority in your jurisdiction) to use the Service.",
        "Notify us promptly at support@mailvoidr.io if you suspect unauthorized access. We may suspend accounts that appear compromised.",
      ],
    },
    {
      id: "acceptable-use",
      title: "4. Acceptable use",
      paragraphs: [
        "You may only use the Service in compliance with applicable law and these Terms. You are solely responsible for the content of messages you send and for obtaining any required consents from recipients.",
        "You must not use Mailvoidr to send spam, phishing, malware, unlawful content, or messages that violate anti-spam laws (including CAN-SPAM, CASL, and GDPR where applicable). You must honor unsubscribe requests and maintain accurate sender identification.",
        "Prohibited uses include, without limitation: harvesting or scraping email addresses; relaying third-party mail without authorization; attempting to bypass plan limits or security controls; probing or disrupting our infrastructure; reselling the Service without a written agreement; and using the sandbox or virtual inboxes to store or transmit illegal material.",
        "We may investigate suspected abuse, throttle or block sending, remove content, and suspend or terminate accounts that violate this section.",
      ],
    },
    {
      id: "your-content",
      title: "5. Your content & data",
      paragraphs: [
        "You retain ownership of content you submit through the Service, including email bodies, templates, domains, and webhook payloads (\"Customer Content\").",
        "You grant Mailvoidr a limited license to host, process, transmit, and display Customer Content solely to operate, secure, and improve the Service, including routing mail, generating logs, delivering webhooks, and running spam or render checks you request.",
        "You represent that you have all rights necessary to submit Customer Content and that doing so does not infringe third-party rights.",
      ],
    },
    {
      id: "billing",
      title: "6. Plans, billing & payment",
      paragraphs: [
        "Paid plans, usage limits, and overage rules are described at mailvoidr.com/pricing. Free tiers may change with reasonable notice.",
        "Subscriptions and one-time charges are processed by our payment provider (currently Paystack). By subscribing, you authorize recurring charges according to your selected plan until you cancel or we terminate access.",
        "Fees are non-refundable except where required by law or explicitly stated otherwise. Downgrades take effect at the next billing period unless we agree otherwise.",
        "Failure to pay may result in suspension of sending, API access, or the entire workspace after notice where practicable.",
      ],
    },
    {
      id: "ip",
      title: "7. Intellectual property",
      paragraphs: [
        "Mailvoidr owns the Service, including software, branding, documentation, and marketplace templates we provide. These Terms do not grant you ownership of our intellectual property.",
        "Feedback you provide may be used by us without restriction or compensation.",
      ],
    },
    {
      id: "third-party",
      title: "8. Third-party services",
      paragraphs: [
        "The Service may integrate with third parties (for example GitHub or Google sign-in, payment processors, or DNS providers). Your use of those services is subject to their terms.",
        "We are not responsible for third-party services outside our reasonable control, including recipient mail providers, DNS propagation, or internet connectivity.",
      ],
    },
    {
      id: "termination",
      title: "9. Suspension & termination",
      paragraphs: [
        "You may stop using the Service at any time. You may request account deletion by contacting support@mailvoidr.io.",
        "We may suspend or terminate access immediately for material breach, abuse, non-payment, or legal requirement. Where reasonable, we will provide notice and an opportunity to cure.",
        "Upon termination, your right to use the Service ends. Sections that by nature should survive (including payment obligations, disclaimers, limitations of liability, and indemnity) will survive.",
      ],
    },
    {
      id: "disclaimers",
      title: "10. Disclaimers",
      paragraphs: [
        "THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE.\" TO THE MAXIMUM EXTENT PERMITTED BY LAW, MAILVOIDR DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
        "We do not guarantee that every message will be delivered, opened, or free of delay. Deliverability depends on recipient systems, your domain reputation, and message content.",
      ],
    },
    {
      id: "liability",
      title: "11. Limitation of liability",
      paragraphs: [
        "TO THE MAXIMUM EXTENT PERMITTED BY LAW, MAILVOIDR WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, REVENUE, DATA, OR GOODWILL.",
        "OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THESE TERMS OR THE SERVICE WILL NOT EXCEED THE GREATER OF (A) AMOUNTS YOU PAID TO MAILVOIDR IN THE TWELVE MONTHS BEFORE THE CLAIM OR (B) USD $100.",
        "Some jurisdictions do not allow certain limitations; in those cases our liability is limited to the fullest extent permitted by law.",
      ],
    },
    {
      id: "indemnity",
      title: "12. Indemnification",
      paragraphs: [
        "You will defend, indemnify, and hold harmless Mailvoidr and its officers, directors, employees, and agents from claims, damages, and expenses (including reasonable legal fees) arising from your use of the Service, Customer Content, or violation of these Terms or applicable law.",
      ],
    },
    {
      id: "changes",
      title: "13. Changes",
      paragraphs: [
        "We may update these Terms from time to time. We will post the revised version on mailvoidr.com/terms and update the \"Last updated\" date. Material changes will be communicated by email or in-product notice when practicable.",
        "Continued use after changes become effective constitutes acceptance. If you disagree with updated Terms, you must stop using the Service.",
      ],
    },
    {
      id: "general",
      title: "14. General",
      paragraphs: [
        "These Terms are governed by the laws of the State of California, excluding conflict-of-law rules. Disputes will be resolved in the state or federal courts located in San Francisco County, California, unless applicable law requires otherwise.",
        "If any provision is unenforceable, the remainder stays in effect. Our failure to enforce a provision is not a waiver.",
        "Questions about these Terms: legal@mailvoidr.io. Mailvoidr, Inc., 548 Market St, San Francisco, CA 94104, United States.",
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDocumentContent = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  summary:
    "This policy explains what information Mailvoidr collects, how we use it, and the choices you have when you use our email platform.",
  lastUpdated: "June 26, 2026",
  contactEmail: LEGAL_CONTACT.privacy,
  sections: [
    {
      id: "introduction",
      title: "1. Introduction",
      paragraphs: [
        "Mailvoidr, Inc. (\"Mailvoidr,\" \"we,\" \"us\") respects your privacy. This Privacy Policy describes how we collect, use, share, and protect personal information when you visit mailvoidr.com, use our dashboard, API, SMTP service, or otherwise interact with us.",
        "This policy applies to account holders and website visitors. It does not cover third-party websites or services you connect to Mailvoidr.",
      ],
    },
    {
      id: "collect",
      title: "2. Information we collect",
      paragraphs: [
        "The information we collect depends on how you use the Service.",
      ],
      bullets: [
        "Account data: name, email address, password hash, workspace membership, role, two-factor settings, and onboarding preferences.",
        "Authentication data: if you sign in with GitHub or Google, we receive profile information those providers share (such as name, email, and provider user ID).",
        "Billing data: plan selection, subscription status, and payment references processed by Paystack. We do not store full payment card numbers.",
        "Usage & technical data: IP address, browser type, device identifiers, API request metadata, send volumes, error logs, and product analytics needed to operate the Service.",
        "Email content & metadata: message bodies, headers, attachments, delivery events, bounces, opens, and clicks associated with messages sent or captured through your workspace — including sandbox mail and virtual inboxes.",
        "Support & communications: messages you send to us via contact forms, email, or support channels.",
      ],
    },
    {
      id: "use",
      title: "3. How we use information",
      paragraphs: [
        "We use personal information to:",
      ],
      bullets: [
        "Provide, maintain, and secure the Service — including routing mail, storing logs, delivering webhooks, and enforcing plan limits.",
        "Authenticate users, prevent fraud and abuse, and troubleshoot incidents.",
        "Process subscriptions and communicate about billing, product updates, and security notices.",
        "Improve reliability and develop new features (often using aggregated or de-identified data).",
        "Comply with legal obligations and respond to lawful requests.",
      ],
    },
    {
      id: "email-content",
      title: "4. Email content & recipients",
      paragraphs: [
        "When you send or capture email through Mailvoidr, we process that content as your data processor to deliver the functionality you request. You control what is sent and to whom.",
        "Sandbox and virtual inbox messages are stored for testing and inspection within retention limits tied to your plan. Production send logs and event history are retained according to workspace settings and plan tier.",
        "You are responsible for providing appropriate privacy notices to your end users and obtaining lawful bases for processing their data where required.",
      ],
    },
    {
      id: "tracking",
      title: "5. Opens, clicks & analytics",
      paragraphs: [
        "If you enable open or click tracking, we insert tracking pixels or rewrite links to record engagement events. Those events appear in your dashboard and may be forwarded to your application via webhooks.",
        "You must disclose tracking practices to recipients where required by law and honor marketing consent rules in your jurisdiction.",
      ],
    },
    {
      id: "sharing",
      title: "6. How we share information",
      paragraphs: [
        "We do not sell personal information. We share information only as described below:",
      ],
      bullets: [
        "Service providers: infrastructure hosts, email delivery partners, payment processors (Paystack), error monitoring, and customer support tools — bound by confidentiality and data-processing terms.",
        "Your directions: when you configure webhooks, team invitations, or integrations, data is shared as you instruct.",
        "Legal & safety: when required by law, to protect rights and safety, or to investigate abuse.",
        "Business transfers: in connection with a merger, acquisition, or asset sale, subject to continued protection consistent with this policy.",
      ],
    },
    {
      id: "retention",
      title: "7. Data retention",
      paragraphs: [
        "We retain information for as long as your account is active and as needed to provide the Service, comply with law, resolve disputes, and enforce agreements.",
        "Email logs, sandbox captures, and analytics data are deleted or anonymized according to plan retention windows after account closure or when you delete resources, unless a longer period is required by law.",
        "You may request deletion of your account by contacting privacy@mailvoidr.io.",
      ],
    },
    {
      id: "security",
      title: "8. Security",
      paragraphs: [
        "We use administrative, technical, and organizational measures designed to protect personal information, including encryption in transit, access controls, and monitoring.",
        "No method of transmission or storage is completely secure. Report suspected vulnerabilities to support@mailvoidr.io.",
      ],
    },
    {
      id: "rights",
      title: "9. Your choices & rights",
      paragraphs: [
        "Depending on your location, you may have rights to access, correct, delete, restrict, or port personal information, and to object to or withdraw consent for certain processing.",
        "You can update profile and workspace settings in the dashboard. Marketing emails include an unsubscribe link where applicable.",
        "To exercise privacy rights, email privacy@mailvoidr.io. We may verify your identity before responding. If you are in the EEA or UK, you may lodge a complaint with your local supervisory authority.",
      ],
    },
    {
      id: "international",
      title: "10. International transfers",
      paragraphs: [
        "Mailvoidr is based in the United States. Information may be processed in the U.S. and other countries where we or our providers operate. We use appropriate safeguards for cross-border transfers where required.",
      ],
    },
    {
      id: "children",
      title: "11. Children's privacy",
      paragraphs: [
        "The Service is not directed to children under 16, and we do not knowingly collect personal information from them. Contact privacy@mailvoidr.io if you believe we have collected a child's information.",
      ],
    },
    {
      id: "changes",
      title: "12. Changes to this policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. We will post changes at mailvoidr.com/privacy and update the \"Last updated\" date. Material changes will be communicated when practicable.",
      ],
    },
    {
      id: "contact",
      title: "13. Contact us",
      paragraphs: [
        "Privacy questions and requests: privacy@mailvoidr.io",
        "General support: support@mailvoidr.io",
        "Mailvoidr, Inc., 548 Market St, San Francisco, CA 94104, United States",
      ],
    },
  ],
};
