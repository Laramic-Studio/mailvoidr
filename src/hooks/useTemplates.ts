import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTemplate,
  createTemplateVersion,
  deleteTemplate,
  fetchTemplate,
  fetchTemplates,
  previewTemplate,
  updateTemplate,
  type CreateTemplatePayload,
  type CreateTemplateVersionPayload,
  type UpdateTemplatePayload,
} from '@/lib/api/templates';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

export function useTemplates(search?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.templates.list(search),
    queryFn: () => fetchTemplates(search),
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useTemplate(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.templates.detail(id ?? ''),
    queryFn: () => fetchTemplate(id!),
    enabled: Boolean(user?.onboarding_completed && id),
  });
}

export function useTemplateMutations() {
  const queryClient = useQueryClient();

  const invalidate = (id?: string) => {
    queryClient.invalidateQueries({ queryKey: ['templates'] });
    if (id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(id) });
    }
  };

  const create = useMutation({
    mutationFn: (payload: CreateTemplatePayload) => createTemplate(payload),
    onSuccess: () => invalidate(),
  });

  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTemplatePayload }) =>
      updateTemplate(id, payload),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const publishVersion = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CreateTemplateVersionPayload }) =>
      createTemplateVersion(id, payload),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const preview = useMutation({
    mutationFn: ({
      id,
      variables,
      templateVersionId,
    }: {
      id: string;
      variables?: Record<string, string>;
      templateVersionId?: string;
    }) =>
      previewTemplate(id, {
        variables,
        template_version_id: templateVersionId,
      }),
  });

  const remove = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => invalidate(),
  });

  return { create, update, publishVersion, preview, remove };
}
