import { API_URL, publicApi } from '@/lib/api';
import {
  normalizeConfirmState,
  normalizePublicForm,
  normalizeSubscribeResult,
  normalizeUnsubscribeState,
} from '@/lib/newsletter/normalize';
import type {
  PublicConfirmState,
  PublicFormPayload,
  PublicResubscribeResult,
  PublicSubscribeResult,
  PublicUnsubscribeState,
} from '@/types/newsletter';

export function publicNewsletterAction(path: string): string {
  return `${API_URL.replace(/\/$/, '')}${path}`;
}

export async function fetchPublicForm(slug: string): Promise<PublicFormPayload> {
  const { data } = await publicApi.get(`/public/newsletter/forms/${slug}`);
  return normalizePublicForm(data);
}

export async function submitPublicSubscribe(
  slug: string,
  payload: { email: string; first_name?: string; company_website?: string; recaptcha_token?: string },
): Promise<PublicSubscribeResult> {
  const { data } = await publicApi.post(`/public/newsletter/forms/${slug}/subscribe`, payload);
  return normalizeSubscribeResult(data);
}

/** Read-only lookup. Must never be used to confirm — scanners follow GET links. */
export async function fetchPublicConfirm(token: string): Promise<PublicConfirmState> {
  const { data } = await publicApi.get(`/public/newsletter/confirm/${token}`);
  return normalizeConfirmState(data);
}

/** Confirms the subscription. Called once by the confirm page after it mounts; GETs never confirm. */
export async function submitPublicConfirm(token: string): Promise<PublicConfirmState> {
  const { data } = await publicApi.post(`/public/newsletter/confirm/${token}`);
  return normalizeConfirmState(data);
}

export async function resendPublicConfirm(token: string): Promise<{ message: string }> {
  const { data } = await publicApi.post(`/public/newsletter/confirm/${token}/resend`);
  return { message: typeof data?.message === 'string' ? data.message : 'A new link is on the way.' };
}

/** Read-only. Must never be used to unsubscribe — scanners follow GET links. */
export async function fetchPublicUnsubscribe(token: string): Promise<PublicUnsubscribeState> {
  const { data } = await publicApi.get(`/public/newsletter/unsubscribe/${token}`);
  return normalizeUnsubscribeState(data);
}

export async function submitPublicUnsubscribe(token: string): Promise<PublicUnsubscribeState> {
  const { data } = await publicApi.post(`/public/newsletter/unsubscribe/${token}`);
  return normalizeUnsubscribeState(data);
}

export async function submitPublicResubscribe(token: string): Promise<PublicResubscribeResult> {
  const { data } = await publicApi.post(`/public/newsletter/unsubscribe/${token}/resubscribe`);
  const body = (data ?? {}) as Record<string, unknown>;
  return {
    masked_email: String(body.masked_email ?? ''),
    requires_confirmation: body.requires_confirmation !== false,
    message: typeof body.message === 'string' ? body.message : null,
  };
}
