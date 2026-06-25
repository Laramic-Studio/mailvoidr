import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchSendHistory,
  previewEmail,
  sendEmail,
  type PreviewEmailPayload,
  type SendEmailPayload,
} from '@/lib/api/send';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

export function useSendHistory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.send.history,
    queryFn: fetchSendHistory,
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useSendMutations() {
  const queryClient = useQueryClient();

  const invalidateHistory = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.send.history });

  const send = useMutation({
    mutationFn: (payload: SendEmailPayload) => sendEmail(payload),
    onSuccess: invalidateHistory,
  });

  const preview = useMutation({
    mutationFn: (payload: PreviewEmailPayload) => previewEmail(payload),
  });

  return { send, preview };
}
