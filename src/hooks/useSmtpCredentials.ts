import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  enableSmtpCredentials,
  fetchSmtpCredentials,
  rotateSmtpPassword,
} from '@/lib/api/smtp-credentials';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

export function useSmtpCredentials() {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.smtpCredentials.all,
    queryFn: fetchSmtpCredentials,
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useSmtpCredentialMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.smtpCredentials.all });

  const enable = useMutation({
    mutationFn: enableSmtpCredentials,
    onSuccess: invalidate,
  });

  const rotatePassword = useMutation({
    mutationFn: rotateSmtpPassword,
    onSuccess: invalidate,
  });

  return { enable, rotatePassword };
}
