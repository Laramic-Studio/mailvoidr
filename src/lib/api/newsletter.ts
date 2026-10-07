import { api } from '@/lib/api';
import {
  listMeta,
  normalizeAudience,
  normalizeCampaign,
  normalizeForm,
  normalizeImport,
  normalizeRecipient,
  normalizeReport,
  normalizeSettings,
  normalizeSubscriber,
  normalizeSubscriberDetail,
  unwrapList,
  unwrapResource,
} from '@/lib/newsletter/normalize';
import type {
  Audience,
  AudienceListResponse,
  Campaign,
  CampaignListResponse,
  CampaignRecipientListResponse,
  CampaignReport,
  ImportColumn,
  NewsletterForm,
  NewsletterFormListResponse,
  NewsletterImport,
  NewsletterSettings,
  SubscriberDetail,
  SubscriberListResponse,
} from '@/types/newsletter';

/**
 * Tenant newsletter API under /api/v1, aligned with laravel-mailer PR 5.
 * Lists use `{ data, meta }`. Single resources accept `{ audience }` or `{ data }`.
 * Rates stay on the API's percent scale.
 */

function messageOf(payload: unknown): string {
  if (payload && typeof payload === 'object' && typeof (payload as { message?: unknown }).message === 'string') {
    return (payload as { message: string }).message;
  }
  return 'Saved.';
}

export async function fetchNewsletterSettings(): Promise<NewsletterSettings> {
  const { data } = await api.get('/newsletter/settings');
  return normalizeSettings(data);
}

export async function updateNewsletterSettings(payload: {
  physical_address?: string;
  doi_for_imports?: boolean;
  attestation?: string;
}): Promise<NewsletterSettings> {
  const { data } = await api.patch('/newsletter/settings', payload);
  return normalizeSettings(data);
}

export async function fetchAudiences(search?: string): Promise<AudienceListResponse> {
  const { data } = await api.get('/newsletter/audiences', {
    params: search ? { search } : undefined,
  });
  return { data: unwrapList(data).map(normalizeAudience), meta: listMeta(data) };
}

export async function fetchAudience(id: string): Promise<{ audience: Audience }> {
  const { data } = await api.get(`/newsletter/audiences/${id}`);
  return { audience: normalizeAudience(unwrapResource(data, 'audience')) };
}

export async function createAudience(payload: {
  name: string;
  description?: string;
}): Promise<{ audience: Audience; message: string }> {
  const { data } = await api.post('/newsletter/audiences', payload);
  return {
    audience: normalizeAudience(unwrapResource(data, 'audience')),
    message: messageOf(data),
  };
}

export async function updateAudience(
  id: string,
  payload: { name?: string; description?: string | null },
): Promise<{ audience: Audience; message: string }> {
  const { data } = await api.patch(`/newsletter/audiences/${id}`, payload);
  return {
    audience: normalizeAudience(unwrapResource(data, 'audience')),
    message: messageOf(data),
  };
}

export async function deleteAudience(id: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/newsletter/audiences/${id}`);
  return { message: messageOf(data) };
}

export async function exportAudience(id: string): Promise<Blob> {
  const { data } = await api.get(`/newsletter/audiences/${id}/export`, { responseType: 'blob' });
  return data as Blob;
}

export async function fetchSubscribers(
  audienceId: string,
  params: { search?: string; status?: string; tag?: string; page?: number },
): Promise<SubscriberListResponse> {
  const { data } = await api.get(`/newsletter/audiences/${audienceId}/subscribers`, { params });
  return { data: unwrapList(data).map(normalizeSubscriber), meta: listMeta(data) };
}

export async function fetchSubscriber(
  audienceId: string,
  subscriberId: string,
): Promise<{ subscriber: SubscriberDetail }> {
  const { data } = await api.get(`/newsletter/audiences/${audienceId}/subscribers/${subscriberId}`);
  return { subscriber: normalizeSubscriberDetail(unwrapResource(data, 'subscriber')) };
}

export async function createSubscriber(
  audienceId: string,
  payload: { email: string; first_name?: string; last_name?: string; tags?: string[] },
): Promise<{ message: string }> {
  const { data } = await api.post(`/newsletter/audiences/${audienceId}/subscribers`, payload);
  return { message: messageOf(data) };
}

export async function updateSubscriber(
  audienceId: string,
  subscriberId: string,
  payload: { tags?: string[]; fields?: Record<string, string> },
): Promise<{ subscriber: SubscriberDetail; message: string }> {
  const { data } = await api.patch(
    `/newsletter/audiences/${audienceId}/subscribers/${subscriberId}`,
    payload,
  );
  return {
    subscriber: normalizeSubscriberDetail(unwrapResource(data, 'subscriber')),
    message: messageOf(data),
  };
}

export async function unsubscribeSubscriber(
  audienceId: string,
  subscriberId: string,
): Promise<{ message: string }> {
  const { data } = await api.post(
    `/newsletter/audiences/${audienceId}/subscribers/${subscriberId}/unsubscribe`,
  );
  return { message: messageOf(data) };
}

export async function deleteSubscriberData(
  audienceId: string,
  subscriberId: string,
): Promise<{ message: string }> {
  const { data } = await api.delete(
    `/newsletter/audiences/${audienceId}/subscribers/${subscriberId}`,
  );
  return { message: messageOf(data) };
}

export async function exportSubscriberConsent(
  audienceId: string,
  subscriberId: string,
): Promise<Blob> {
  const { data } = await api.get(
    `/newsletter/audiences/${audienceId}/subscribers/${subscriberId}/consent`,
    { responseType: 'blob' },
  );
  return data as Blob;
}

export async function uploadAudienceImport(
  audienceId: string,
  file: File,
  tags: string[],
): Promise<{ import: NewsletterImport; message: string }> {
  const form = new FormData();
  form.append('file', file);
  tags.forEach((tag) => form.append('tags[]', tag));
  const { data } = await api.post(`/newsletter/audiences/${audienceId}/imports`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return {
    import: normalizeImport(unwrapResource(data, 'import')),
    message: messageOf(data),
  };
}

export async function commitAudienceImport(
  importId: string,
  payload: { columns: ImportColumn[]; consent_confirmed: true },
): Promise<{ import: NewsletterImport; message: string }> {
  const { data } = await api.post(`/newsletter/imports/${importId}/commit`, payload);
  return {
    import: normalizeImport(unwrapResource(data, 'import')),
    message: messageOf(data),
  };
}

export async function fetchAudienceImport(importId: string): Promise<{ import: NewsletterImport }> {
  const { data } = await api.get(`/newsletter/imports/${importId}`);
  return { import: normalizeImport(unwrapResource(data, 'import')) };
}

export async function downloadImportErrors(importId: string): Promise<Blob> {
  const { data } = await api.get(`/newsletter/imports/${importId}/errors`, { responseType: 'blob' });
  return data as Blob;
}

export async function fetchForms(audienceId?: string): Promise<NewsletterFormListResponse> {
  const { data } = await api.get('/newsletter/forms', {
    params: audienceId ? { audience_id: audienceId } : undefined,
  });
  return { data: unwrapList(data).map(normalizeForm), meta: listMeta(data) };
}

export async function fetchForm(id: string): Promise<{ form: NewsletterForm }> {
  const { data } = await api.get(`/newsletter/forms/${id}`);
  return { form: normalizeForm(unwrapResource(data, 'form')) };
}

export async function createForm(payload: {
  name: string;
  audience_id: string;
}): Promise<{ form: NewsletterForm; message: string }> {
  const { data } = await api.post('/newsletter/forms', payload);
  return { form: normalizeForm(unwrapResource(data, 'form')), message: messageOf(data) };
}

export async function updateForm(
  id: string,
  payload: Partial<{
    name: string;
    audience_id: string;
    status: string;
    first_name_enabled: boolean;
    button_label: string;
    consent_text: string;
    redirect_url: string | null;
    captcha_enabled: boolean;
    confirmation_email: Partial<NewsletterForm['confirmation_email']>;
    confirmation_page: Partial<NewsletterForm['confirmation_page']>;
  }>,
): Promise<{ form: NewsletterForm; message: string }> {
  const { data } = await api.patch(`/newsletter/forms/${id}`, payload);
  return { form: normalizeForm(unwrapResource(data, 'form')), message: messageOf(data) };
}

export async function deleteForm(id: string): Promise<{ message: string }> {
  const { data } = await api.delete(`/newsletter/forms/${id}`);
  return { message: messageOf(data) };
}

export async function uploadFormLogo(
  id: string,
  file: File,
  placement: 'confirmation_email' | 'confirmation_page',
): Promise<{ form: NewsletterForm; message: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('placement', placement);
  const { data } = await api.post(`/newsletter/forms/${id}/logo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return { form: normalizeForm(unwrapResource(data, 'form')), message: messageOf(data) };
}

export async function fetchCampaigns(): Promise<CampaignListResponse> {
  const { data } = await api.get('/newsletter/campaigns');
  return { data: unwrapList(data).map(normalizeCampaign), meta: listMeta(data) };
}

export async function fetchCampaign(id: string): Promise<{ campaign: Campaign }> {
  const { data } = await api.get(`/newsletter/campaigns/${id}`);
  return { campaign: normalizeCampaign(unwrapResource(data, 'campaign')) };
}

export async function createCampaign(payload: { name: string }): Promise<{ campaign: Campaign; message: string }> {
  const { data } = await api.post('/newsletter/campaigns', payload);
  return { campaign: normalizeCampaign(unwrapResource(data, 'campaign')), message: messageOf(data) };
}

export async function updateCampaign(
  id: string,
  payload: Partial<{
    name: string;
    audience_id: string | null;
    include_tags: string[];
    exclude_tags: string[];
    from_name: string | null;
    from_address: string | null;
    reply_to: string | null;
    subject: string | null;
    subject_b: string | null;
    preview_text: string | null;
    html: string | null;
    text: string | null;
    design_json: unknown;
    template_id: string | null;
    template_version_id: string | null;
    ab_test_enabled: boolean;
    ab_test_share: number | null;
    ab_winner_rule: 'click_rate' | 'manual' | null;
    ab_wait_hours: number | null;
  }>,
): Promise<{ campaign: Campaign; message: string }> {
  const { data } = await api.patch(`/newsletter/campaigns/${id}`, payload);
  return { campaign: normalizeCampaign(unwrapResource(data, 'campaign')), message: messageOf(data) };
}

export async function sendCampaignTest(
  id: string,
  emails: string[],
): Promise<{ message: string }> {
  const { data } = await api.post(`/newsletter/campaigns/${id}/test`, { emails });
  return { message: messageOf(data) };
}

export async function scheduleCampaign(
  id: string,
  payload: { send_at: string; timezone: string },
): Promise<{ campaign: Campaign; message: string }> {
  const { data } = await api.post(`/newsletter/campaigns/${id}/schedule`, payload);
  return { campaign: normalizeCampaign(unwrapResource(data, 'campaign')), message: messageOf(data) };
}

export async function sendCampaign(id: string): Promise<{ campaign: Campaign; message: string }> {
  const { data } = await api.post(`/newsletter/campaigns/${id}/send`);
  return { campaign: normalizeCampaign(unwrapResource(data, 'campaign')), message: messageOf(data) };
}

export async function pauseCampaign(id: string): Promise<{ campaign: Campaign; message: string }> {
  const { data } = await api.post(`/newsletter/campaigns/${id}/pause`);
  return { campaign: normalizeCampaign(unwrapResource(data, 'campaign')), message: messageOf(data) };
}

export async function resumeCampaign(id: string): Promise<{ campaign: Campaign; message: string }> {
  const { data } = await api.post(`/newsletter/campaigns/${id}/resume`);
  return { campaign: normalizeCampaign(unwrapResource(data, 'campaign')), message: messageOf(data) };
}

export async function cancelCampaign(id: string): Promise<{ campaign: Campaign; message: string }> {
  const { data } = await api.post(`/newsletter/campaigns/${id}/cancel`);
  return { campaign: normalizeCampaign(unwrapResource(data, 'campaign')), message: messageOf(data) };
}

export async function pickCampaignWinner(
  id: string,
  variant: 'a' | 'b',
): Promise<{ campaign: Campaign; message: string }> {
  const { data } = await api.post(`/newsletter/campaigns/${id}/winner`, { variant });
  return { campaign: normalizeCampaign(unwrapResource(data, 'campaign')), message: messageOf(data) };
}

export async function fetchCampaignReport(id: string): Promise<{ report: CampaignReport }> {
  const { data } = await api.get(`/newsletter/campaigns/${id}/report`);
  return { report: normalizeReport(unwrapResource(data, 'report')) };
}

export async function fetchCampaignRecipients(
  id: string,
  params: { status?: string; page?: number },
): Promise<CampaignRecipientListResponse> {
  const { data } = await api.get(`/newsletter/campaigns/${id}/recipients`, { params });
  return { data: unwrapList(data).map(normalizeRecipient), meta: listMeta(data) };
}

export async function exportCampaignRecipients(id: string): Promise<Blob> {
  const { data } = await api.get(`/newsletter/campaigns/${id}/recipients/export`, {
    responseType: 'blob',
  });
  return data as Blob;
}
