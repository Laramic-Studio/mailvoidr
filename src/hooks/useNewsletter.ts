import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelCampaign,
  commitAudienceImport,
  createAudience,
  createCampaign,
  createForm,
  createSubscriber,
  deleteAudience,
  deleteForm,
  deleteSubscriberData,
  fetchAudience,
  fetchAudienceImport,
  fetchAudiences,
  fetchCampaign,
  fetchCampaignRecipients,
  fetchCampaignReport,
  fetchCampaigns,
  fetchForm,
  fetchForms,
  fetchNewsletterSettings,
  fetchSubscriber,
  fetchSubscribers,
  pauseCampaign,
  pickCampaignWinner,
  resumeCampaign,
  scheduleCampaign,
  sendCampaign,
  sendCampaignTest,
  unsubscribeSubscriber,
  updateAudience,
  updateCampaign,
  updateForm,
  updateNewsletterSettings,
  updateSubscriber,
  uploadAudienceImport,
  uploadFormLogo,
} from '@/lib/api/newsletter';
import type { ImportColumn } from '@/types/newsletter';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

function useNewsletterEnabled() {
  const { user } = useAuth();
  return Boolean(user?.onboarding_completed);
}

export function useNewsletterSettings() {
  const enabled = useNewsletterEnabled();
  return useQuery({
    queryKey: queryKeys.newsletter.settings,
    queryFn: fetchNewsletterSettings,
    enabled,
    retry: false,
  });
}

export function useNewsletterSettingsMutations() {
  const queryClient = useQueryClient();
  const update = useMutation({
    mutationFn: updateNewsletterSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(queryKeys.newsletter.settings, settings);
    },
  });
  return { update };
}

export function useAudiences(search?: string) {
  const enabled = useNewsletterEnabled();
  return useQuery({
    queryKey: queryKeys.newsletter.audiences(search),
    queryFn: () => fetchAudiences(search),
    enabled,
  });
}

export function useAudience(id: string | undefined) {
  const enabled = useNewsletterEnabled();
  return useQuery({
    queryKey: queryKeys.newsletter.audience(id ?? ''),
    queryFn: () => fetchAudience(id!),
    enabled: Boolean(enabled && id),
  });
}

export function useAudienceMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['newsletter', 'audiences'] });
  };
  const create = useMutation({ mutationFn: createAudience, onSuccess: invalidate });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; description?: string | null } }) =>
      updateAudience(id, payload),
    onSuccess: invalidate,
  });
  const remove = useMutation({ mutationFn: deleteAudience, onSuccess: invalidate });
  return { create, update, remove };
}

export function useSubscribers(
  audienceId: string | undefined,
  params: { search?: string; status?: string; tag?: string; page?: number },
) {
  const enabled = useNewsletterEnabled();
  const filterKey = JSON.stringify(params);
  return useQuery({
    queryKey: queryKeys.newsletter.subscribers(audienceId ?? '', filterKey),
    queryFn: () => fetchSubscribers(audienceId!, params),
    enabled: Boolean(enabled && audienceId),
  });
}

export function useSubscriber(audienceId: string | undefined, subscriberId: string | undefined) {
  const enabled = useNewsletterEnabled();
  return useQuery({
    queryKey: queryKeys.newsletter.subscriber(audienceId ?? '', subscriberId ?? ''),
    queryFn: () => fetchSubscriber(audienceId!, subscriberId!),
    enabled: Boolean(enabled && audienceId && subscriberId),
  });
}

export function useSubscriberMutations(audienceId: string | undefined) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    if (!audienceId) return;
    queryClient.invalidateQueries({ queryKey: ['newsletter', 'audiences', audienceId] });
    queryClient.invalidateQueries({ queryKey: ['newsletter', 'subscribers', audienceId] });
    queryClient.invalidateQueries({ queryKey: queryKeys.newsletter.audience(audienceId) });
  };
  const create = useMutation({
    mutationFn: (payload: { email: string; first_name?: string; last_name?: string; tags?: string[] }) =>
      createSubscriber(audienceId!, payload),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({
      subscriberId,
      payload,
    }: {
      subscriberId: string;
      payload: { tags?: string[]; fields?: Record<string, string> };
    }) => updateSubscriber(audienceId!, subscriberId, payload),
    onSuccess: invalidate,
  });
  const unsubscribe = useMutation({
    mutationFn: (subscriberId: string) => unsubscribeSubscriber(audienceId!, subscriberId),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (subscriberId: string) => deleteSubscriberData(audienceId!, subscriberId),
    onSuccess: invalidate,
  });
  return { create, update, unsubscribe, remove };
}

export function useImportJob(importId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.newsletter.importJob(importId ?? ''),
    queryFn: () => fetchAudienceImport(importId!),
    enabled: Boolean(importId && enabled),
    refetchInterval: (query) => {
      const status = query.state.data?.import.status;
      return status === 'processing' || status === 'mapping' ? 4000 : false;
    },
  });
}

export function useImportMutations() {
  const upload = useMutation({
    mutationFn: ({ audienceId, file, tags }: { audienceId: string; file: File; tags: string[] }) =>
      uploadAudienceImport(audienceId, file, tags),
  });
  const commit = useMutation({
    mutationFn: ({ importId, columns }: { importId: string; columns: ImportColumn[] }) =>
      commitAudienceImport(importId, { columns, consent_confirmed: true }),
  });
  return { upload, commit };
}

export function useForms(audienceId?: string) {
  const enabled = useNewsletterEnabled();
  return useQuery({
    queryKey: queryKeys.newsletter.forms(audienceId),
    queryFn: () => fetchForms(audienceId),
    enabled,
  });
}

export function useForm(id: string | undefined) {
  const enabled = useNewsletterEnabled();
  return useQuery({
    queryKey: queryKeys.newsletter.form(id ?? ''),
    queryFn: () => fetchForm(id!),
    enabled: Boolean(enabled && id),
  });
}

export function useFormMutations() {
  const queryClient = useQueryClient();
  const invalidate = (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['newsletter', 'forms'] });
    if (id) queryClient.invalidateQueries({ queryKey: queryKeys.newsletter.form(id) });
  };
  const create = useMutation({ mutationFn: createForm, onSuccess: () => invalidate() });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateForm>[1] }) =>
      updateForm(id, payload),
    onSuccess: (result) => invalidate(result.form.id),
  });
  const remove = useMutation({ mutationFn: deleteForm, onSuccess: () => invalidate() });
  const uploadLogo = useMutation({
    mutationFn: ({
      id,
      file,
      placement,
    }: {
      id: string;
      file: File;
      placement: 'confirmation_email' | 'confirmation_page';
    }) => uploadFormLogo(id, file, placement),
    onSuccess: (result) => invalidate(result.form.id),
  });
  return { create, update, remove, uploadLogo };
}

export function useCampaigns() {
  const enabled = useNewsletterEnabled();
  return useQuery({
    queryKey: queryKeys.newsletter.campaigns,
    queryFn: fetchCampaigns,
    enabled,
  });
}

export function useCampaign(id: string | undefined) {
  const enabled = useNewsletterEnabled();
  return useQuery({
    queryKey: queryKeys.newsletter.campaign(id ?? ''),
    queryFn: () => fetchCampaign(id!),
    enabled: Boolean(enabled && id),
    refetchInterval: (query) => (query.state.data?.campaign.status === 'sending' ? 5000 : false),
  });
}

export function useCampaignMutations() {
  const queryClient = useQueryClient();
  const invalidate = (id?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.newsletter.campaigns });
    if (id) queryClient.invalidateQueries({ queryKey: queryKeys.newsletter.campaign(id) });
  };
  const create = useMutation({ mutationFn: createCampaign, onSuccess: (result) => invalidate(result.campaign.id) });
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateCampaign>[1] }) =>
      updateCampaign(id, payload),
    onSuccess: (result) => {
      queryClient.setQueryData(queryKeys.newsletter.campaign(result.campaign.id), result);
      invalidate(result.campaign.id);
    },
  });
  const test = useMutation({
    mutationFn: ({ id, emails }: { id: string; emails: string[] }) => sendCampaignTest(id, emails),
  });
  const schedule = useMutation({
    mutationFn: ({ id, send_at, timezone }: { id: string; send_at: string; timezone: string }) =>
      scheduleCampaign(id, { send_at, timezone }),
    onSuccess: (result) => invalidate(result.campaign.id),
  });
  const send = useMutation({
    mutationFn: (id: string) => sendCampaign(id),
    onSuccess: (result) => invalidate(result.campaign.id),
  });
  const pause = useMutation({
    mutationFn: (id: string) => pauseCampaign(id),
    onSuccess: (result) => invalidate(result.campaign.id),
  });
  const resume = useMutation({
    mutationFn: (id: string) => resumeCampaign(id),
    onSuccess: (result) => invalidate(result.campaign.id),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => cancelCampaign(id),
    onSuccess: (result) => invalidate(result.campaign.id),
  });
  const pickWinner = useMutation({
    mutationFn: ({ id, variant }: { id: string; variant: 'a' | 'b' }) => pickCampaignWinner(id, variant),
    onSuccess: (result) => invalidate(result.campaign.id),
  });
  return { create, update, test, schedule, send, pause, resume, cancel, pickWinner };
}

export function useCampaignReport(id: string | undefined) {
  const enabled = useNewsletterEnabled();
  return useQuery({
    queryKey: queryKeys.newsletter.report(id ?? ''),
    queryFn: () => fetchCampaignReport(id!),
    enabled: Boolean(enabled && id),
  });
}

export function useCampaignRecipients(id: string | undefined, status: string, page: number) {
  const enabled = useNewsletterEnabled();
  return useQuery({
    queryKey: queryKeys.newsletter.recipients(id ?? '', status, page),
    queryFn: () => fetchCampaignRecipients(id!, { status: status || undefined, page }),
    enabled: Boolean(enabled && id),
  });
}
