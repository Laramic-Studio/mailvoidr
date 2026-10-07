import type {
  Audience,
  Campaign,
  CampaignRecipient,
  CampaignReport,
  NewsletterForm,
  NewsletterImport,
  NewsletterSettings,
  PublicConfirmState,
  PublicFormPayload,
  PublicSubscribeResult,
  PublicUnsubscribeState,
  Subscriber,
  SubscriberDetail,
} from '@/types/newsletter';

function num(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function numOrNull(value: unknown): number | null {
  if (value == null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function strOrNull(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value);
  return text.length ? text : null;
}

function readOptionalNumber(record: Record<string, unknown>, keys: string[]): number | null | undefined {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(record, key)) return numOrNull(record[key]);
  }
  return undefined;
}

function readMeterRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function isUsLabel(value: string): boolean {
  const text = value.trim().toLowerCase();
  return text === 'us' || text === 'usa' || text === 'united states' || text === 'united states of america';
}

/** US targeting from the contract flag, with country aliases when that is how the API sends it. */
export function readUsTargeted(body: Record<string, unknown>): boolean | null {
  const flag = body.us_targeted ?? body.targets_us ?? body.is_us_targeted ?? body.requires_physical_address;
  if (typeof flag === 'boolean') return flag;
  if (flag === 1 || flag === '1' || flag === 'true') return true;
  if (flag === 0 || flag === '0' || flag === 'false') return false;
  const country = body.country ?? body.target_country ?? body.region;
  if (typeof country === 'string' && country.trim()) return isUsLabel(country);
  const list = body.countries ?? body.target_countries ?? body.regions;
  if (Array.isArray(list)) {
    return list.some((item) => typeof item === 'string' && isUsLabel(item));
  }
  return null;
}

function readSubscriberMeter(nested: Record<string, unknown>): {
  subscribers_used?: number | null;
  subscriber_limit?: number | null;
} {
  const meter = readMeterRecord(nested.subscribers) ?? readMeterRecord(nested.subscriber_meter);
  const usedFromMeter = meter ? readOptionalNumber(meter, ['used', 'count']) : undefined;
  const limitFromMeter = meter ? readOptionalNumber(meter, ['limit']) : undefined;
  const used = usedFromMeter !== undefined
    ? usedFromMeter
    : readOptionalNumber(nested, ['subscribers_used', 'subscriber_count', 'subscriber_used']);
  const limit = limitFromMeter !== undefined
    ? limitFromMeter
    : readOptionalNumber(nested, ['subscriber_limit', 'subscribers_limit']);
  return {
    ...(used !== undefined ? { subscribers_used: used } : {}),
    ...(limit !== undefined ? { subscriber_limit: limit } : {}),
  };
}

function strList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function recordOfStrings(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, String(entry ?? '')]),
  );
}

export function unwrapResource<T>(payload: unknown, key: string): T {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (record[key] && typeof record[key] === 'object') return record[key] as T;
    if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
      return record.data as T;
    }
  }
  return payload as T;
}

export function unwrapList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)) {
    return (payload as { data: unknown[] }).data;
  }
  return [];
}

export function normalizeSettings(raw: unknown): NewsletterSettings {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const nested = body.settings && typeof body.settings === 'object'
    ? (body.settings as Record<string, unknown>)
    : body;
  const disabledBy = nested.doi_imports_disabled_by;
  return {
    physical_address: strOrNull(nested.physical_address),
    doi_for_imports: typeof nested.doi_for_imports === 'boolean' ? nested.doi_for_imports : undefined,
    doi_imports_editable: typeof nested.doi_imports_editable === 'boolean'
      ? nested.doi_imports_editable
      : undefined,
    doi_imports_disabled_by: disabledBy && typeof disabledBy === 'object'
      ? {
          name: String((disabledBy as { name?: unknown }).name ?? ''),
          at: String((disabledBy as { at?: unknown }).at ?? ''),
        }
      : undefined,
    pending_purge_days: numOrNull(nested.pending_purge_days) ?? undefined,
    plan: strOrNull(nested.plan) ?? undefined,
    review_turnaround: strOrNull(nested.review_turnaround) ?? undefined,
    ...readSubscriberMeter(nested),
    sends_per_minute: numOrNull(nested.sends_per_minute),
    first_large_send_threshold: numOrNull(nested.first_large_send_threshold),
    max_csv_bytes: numOrNull(nested.max_csv_bytes),
  };
}

export function normalizeAudience(raw: unknown): Audience {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const last = body.last_campaign;
  return {
    id: String(body.id ?? ''),
    name: String(body.name ?? 'Untitled audience'),
    description: strOrNull(body.description),
    subscribed_count: num(body.subscribed_count),
    pending_count: num(body.pending_count),
    unsubscribed_count: num(body.unsubscribed_count),
    bounced_count: num(body.bounced_count),
    complained_count: num(body.complained_count),
    confirmation_rate: numOrNull(body.confirmation_rate),
    us_targeted: readUsTargeted(body),
    suppressed_count: body.suppressed_count == null ? undefined : num(body.suppressed_count),
    last_campaign: last && typeof last === 'object'
      ? {
          id: String((last as { id?: unknown }).id ?? ''),
          name: String((last as { name?: unknown }).name ?? ''),
          sent_at: strOrNull((last as { sent_at?: unknown }).sent_at),
        }
      : null,
    created_at: strOrNull(body.created_at),
    updated_at: strOrNull(body.updated_at),
  };
}

export function normalizeSubscriber(raw: unknown): Subscriber {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const first = strOrNull(body.first_name);
  const last = strOrNull(body.last_name);
  const name = strOrNull(body.name) ?? ([first, last].filter(Boolean).join(' ') || null);
  return {
    id: String(body.id ?? ''),
    email: String(body.email ?? ''),
    first_name: first,
    last_name: last,
    name,
    status: String(body.status ?? 'pending'),
    source: strOrNull(body.source),
    tags: strList(body.tags),
    fields: recordOfStrings(body.fields),
    created_at: strOrNull(body.created_at ?? body.added_at),
  };
}

export function normalizeSubscriberDetail(raw: unknown): SubscriberDetail {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const base = normalizeSubscriber(body);
  const consent = Array.isArray(body.consent_log) ? body.consent_log : [];
  const activity = Array.isArray(body.activity) ? body.activity : [];
  return {
    ...base,
    consent_log: consent.map((entry) => {
      const row = (entry ?? {}) as Record<string, unknown>;
      return {
        timestamp: strOrNull(row.timestamp ?? row.created_at),
        ip: strOrNull(row.ip),
        user_agent: strOrNull(row.user_agent),
        source: strOrNull(row.source),
        form_id: strOrNull(row.form_id),
        import_id: strOrNull(row.import_id),
        consent_text_version: strOrNull(row.consent_text_version),
        confirmed_at: strOrNull(row.confirmed_at),
        confirmed_ip: strOrNull(row.confirmed_ip),
      };
    }),
    activity: activity.map((entry) => {
      const row = (entry ?? {}) as Record<string, unknown>;
      return {
        campaign_id: String(row.campaign_id ?? ''),
        campaign_name: String(row.campaign_name ?? 'Campaign'),
        received_at: strOrNull(row.received_at),
        clicks: num(row.clicks),
      };
    }),
  };
}

function previewTable(raw: Record<string, unknown>): { headers: string[]; rows: string[][] } {
  const headers = strList(raw.headers);
  if (Array.isArray(raw.preview_rows) && raw.preview_rows.every((row) => Array.isArray(row))) {
    return {
      headers,
      rows: (raw.preview_rows as unknown[][]).slice(0, 5).map((row) => row.map((cell) => String(cell ?? ''))),
    };
  }
  const objects = Array.isArray(raw.preview) ? raw.preview : Array.isArray(raw.preview_rows) ? raw.preview_rows : [];
  if (objects.length && objects.every((row) => row && typeof row === 'object' && !Array.isArray(row))) {
    const keys = headers.length
      ? headers
      : Object.keys(objects[0] as Record<string, unknown>);
    return {
      headers: keys,
      rows: objects.slice(0, 5).map((row) => keys.map((key) => String((row as Record<string, unknown>)[key] ?? ''))),
    };
  }
  return { headers, rows: [] };
}

export function normalizeImport(raw: unknown): NewsletterImport {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const table = previewTable(body);
  return {
    id: String(body.id ?? ''),
    audience_id: String(body.audience_id ?? ''),
    status: String(body.status ?? 'mapping'),
    delimiter: strOrNull(body.delimiter),
    headers: table.headers,
    preview_rows: table.rows,
    max_csv_bytes: numOrNull(body.max_csv_bytes),
    tags: strList(body.tags),
    uploaded_count: numOrNull(body.uploaded_count ?? body.uploaded),
    added_count: numOrNull(body.added_count ?? body.added),
    updated_count: numOrNull(body.updated_count ?? body.updated),
    rejected_count: numOrNull(body.rejected_count ?? body.rejected),
    skipped_suppressed_count: numOrNull(
      body.skipped_suppressed_count ?? body.skipped_because_suppressed ?? body.skipped,
    ),
    error_report_url: strOrNull(body.error_report_url),
    message: strOrNull(body.message),
  };
}

function normalizeFormEmail(raw: unknown): NewsletterForm['confirmation_email'] {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    from_name: String(body.from_name ?? ''),
    subject: String(body.subject ?? ''),
    logo_url: strOrNull(body.logo_url),
    body: String(body.body ?? ''),
    button_label: String(body.button_label ?? 'Confirm subscription'),
  };
}

function normalizeFormPage(raw: unknown): NewsletterForm['confirmation_page'] {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    logo_url: strOrNull(body.logo_url),
    message: String(body.message ?? ''),
    redirect_url: strOrNull(body.redirect_url),
  };
}

export function normalizeForm(raw: unknown): NewsletterForm {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    id: String(body.id ?? ''),
    name: String(body.name ?? 'Untitled form'),
    slug: String(body.slug ?? body.id ?? ''),
    audience_id: String(body.audience_id ?? ''),
    audience_name: strOrNull(body.audience_name),
    status: String(body.status ?? 'draft'),
    signups_30d: num(body.signups_30d),
    confirmation_rate: numOrNull(body.confirmation_rate),
    public_url: strOrNull(body.public_url),
    embed_html: strOrNull(body.embed_html),
    first_name_enabled: Boolean(body.first_name_enabled),
    button_label: String(body.button_label ?? 'Subscribe'),
    consent_text: String(body.consent_text ?? ''),
    consent_version: numOrNull(body.consent_version),
    redirect_url: strOrNull(body.redirect_url),
    honeypot_enabled: body.honeypot_enabled === undefined ? true : Boolean(body.honeypot_enabled),
    captcha_enabled: Boolean(body.captcha_enabled),
    doi_required: body.doi_required === undefined ? true : Boolean(body.doi_required),
    confirmation_email: normalizeFormEmail(body.confirmation_email),
    confirmation_page: normalizeFormPage(body.confirmation_page),
    created_at: strOrNull(body.created_at),
    updated_at: strOrNull(body.updated_at),
  };
}

export function normalizeCampaign(raw: unknown): Campaign {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    id: String(body.id ?? ''),
    name: String(body.name ?? 'Untitled campaign'),
    status: String(body.status ?? 'draft'),
    audience_id: strOrNull(body.audience_id),
    audience_name: strOrNull(body.audience_name),
    include_tags: strList(body.include_tags),
    exclude_tags: strList(body.exclude_tags),
    eligible_count: numOrNull(body.eligible_count),
    pending_excluded: numOrNull(body.pending_excluded),
    suppressed_excluded: numOrNull(body.suppressed_excluded),
    total_recipients: numOrNull(body.total_recipients),
    sent_count: num(body.sent_count),
    sends_per_minute: numOrNull(body.sends_per_minute),
    recent_sends_per_minute: numOrNull(body.recent_sends_per_minute),
    click_rate: numOrNull(body.click_rate),
    from_name: strOrNull(body.from_name),
    from_address: strOrNull(body.from_address),
    reply_to: strOrNull(body.reply_to),
    subject: strOrNull(body.subject),
    subject_b: strOrNull(body.subject_b),
    preview_text: strOrNull(body.preview_text),
    html: strOrNull(body.html),
    text: strOrNull(body.text),
    design_json: body.design_json ?? null,
    template_id: strOrNull(body.template_id),
    template_version_id: strOrNull(body.template_version_id),
    ab_test_enabled: Boolean(body.ab_test_enabled),
    ab_test_share: numOrNull(body.ab_test_share),
    ab_winner_rule: body.ab_winner_rule === 'manual' || body.ab_winner_rule === 'click_rate'
      ? body.ab_winner_rule
      : null,
    ab_wait_hours: numOrNull(body.ab_wait_hours),
    ab_status: strOrNull(body.ab_status),
    ab_variant_a_clicks: numOrNull(body.ab_variant_a_clicks),
    ab_variant_b_clicks: numOrNull(body.ab_variant_b_clicks),
    scheduled_at: strOrNull(body.scheduled_at),
    timezone: strOrNull(body.timezone),
    sent_at: strOrNull(body.sent_at),
    requires_review: Boolean(body.requires_review),
    review_reason: strOrNull(body.review_reason),
    review_turnaround: strOrNull(body.review_turnaround),
    auto_pause_reason: strOrNull(body.auto_pause_reason),
    has_unsubscribe_link: typeof body.has_unsubscribe_link === 'boolean' ? body.has_unsubscribe_link : null,
    has_physical_address: typeof body.has_physical_address === 'boolean' ? body.has_physical_address : null,
    us_targeted: readUsTargeted(body),
    created_at: strOrNull(body.created_at),
    updated_at: strOrNull(body.updated_at),
  };
}

export function normalizeReport(raw: unknown): CampaignReport {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const ab = body.ab && typeof body.ab === 'object' ? (body.ab as Record<string, unknown>) : null;
  const variants = ab && Array.isArray(ab.variants) ? ab.variants : [];
  const links = Array.isArray(body.top_links) ? body.top_links : [];
  return {
    click_rate: numOrNull(body.click_rate),
    delivered_count: num(body.delivered_count ?? body.delivered),
    unsubscribed_count: num(body.unsubscribed_count ?? body.unsubscribed),
    bounced_count: num(body.bounced_count ?? body.bounced),
    bounced_hard_count: numOrNull(body.bounced_hard_count ?? body.hard_bounces),
    bounced_soft_count: numOrNull(body.bounced_soft_count ?? body.soft_bounces),
    complaint_rate: numOrNull(body.complaint_rate),
    complaints_available: body.complaints_available === true,
    open_rate: numOrNull(body.open_rate),
    unique_opens: numOrNull(body.unique_opens),
    ab: ab
      ? {
          picked_by: ab.picked_by === 'rule' || ab.picked_by === 'manual' ? ab.picked_by : null,
          winner: strOrNull(ab.winner),
          variants: variants.map((entry) => {
            const row = (entry ?? {}) as Record<string, unknown>;
            return {
              variant: String(row.variant ?? 'a'),
              subject: String(row.subject ?? ''),
              recipients: num(row.recipients),
              unique_clicks: num(row.unique_clicks),
              click_rate: numOrNull(row.click_rate),
              winner: Boolean(row.winner),
            };
          }),
        }
      : null,
    top_links: links.map((entry) => {
      const row = (entry ?? {}) as Record<string, unknown>;
      return { url: String(row.url ?? ''), unique_clicks: num(row.unique_clicks) };
    }),
  };
}

export function normalizeRecipient(raw: unknown): CampaignRecipient {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    id: String(body.id ?? ''),
    email: String(body.email ?? ''),
    status: String(body.status ?? ''),
    clicked: Boolean(body.clicked),
    opened: Boolean(body.opened),
  };
}

export function normalizePublicForm(raw: unknown): PublicFormPayload {
  const body = unwrapResource<Record<string, unknown>>(raw, 'form');
  return {
    name: String(body.name ?? 'Subscribe'),
    tenant_name: String(body.tenant_name ?? body.workspace_name ?? 'this list'),
    logo_url: strOrNull(body.logo_url),
    first_name_enabled: Boolean(body.first_name_enabled),
    button_label: String(body.button_label ?? 'Subscribe'),
    consent_text: String(body.consent_text ?? ''),
    honeypot_enabled: body.honeypot_enabled === undefined ? true : Boolean(body.honeypot_enabled),
    captcha_enabled: Boolean(body.captcha_enabled),
  };
}

export function normalizeSubscribeResult(raw: unknown): PublicSubscribeResult {
  const body = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    masked_email: String(body.masked_email ?? body.email ?? ''),
    message: strOrNull(body.message),
  };
}

export function normalizeConfirmState(raw: unknown): PublicConfirmState {
  const body = unwrapResource<Record<string, unknown>>(raw, 'confirm');
  return {
    outcome: String(body.outcome ?? body.status ?? 'pending'),
    tenant_name: String(body.tenant_name ?? body.workspace_name ?? ''),
    logo_url: strOrNull(body.logo_url),
    message: strOrNull(body.message),
    redirect_url: strOrNull(body.redirect_url),
  };
}

export function normalizeUnsubscribeState(raw: unknown): PublicUnsubscribeState {
  const body = unwrapResource<Record<string, unknown>>(raw, 'unsubscribe');
  return {
    tenant_name: String(body.tenant_name ?? body.workspace_name ?? ''),
    logo_url: strOrNull(body.logo_url),
    masked_email: String(body.masked_email ?? ''),
    status: String(body.status ?? 'subscribed'),
    can_resubscribe: Boolean(body.can_resubscribe),
  };
}

export function listMeta(payload: unknown): {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  counts?: Partial<Record<string, number>>;
  tags?: string[];
  can_export?: boolean;
} | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const meta = (payload as { meta?: unknown }).meta;
  if (!meta || typeof meta !== 'object') return undefined;
  const body = meta as Record<string, unknown>;
  const counts = body.counts && typeof body.counts === 'object'
    ? Object.fromEntries(
        Object.entries(body.counts as Record<string, unknown>).map(([key, value]) => [key, num(value)]),
      )
    : undefined;
  return {
    current_page: num(body.current_page, 1),
    last_page: num(body.last_page, 1),
    per_page: num(body.per_page, 25),
    total: num(body.total),
    counts,
    tags: body.tags ? strList(body.tags) : undefined,
    can_export: typeof body.can_export === 'boolean' ? body.can_export : undefined,
  };
}
