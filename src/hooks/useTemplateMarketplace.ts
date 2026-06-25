import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addMarketplaceTemplateToLibrary,
  fetchTemplateMarketplace,
  fetchTemplateMarketplaceItem,
  previewMarketplaceTemplate,
} from '@/lib/api/template-marketplace';
import { queryKeys } from '@/lib/query-keys';
import { useAuth } from '@/hooks/useAuth';

export function useTemplateMarketplace(search?: string, category?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.templateMarketplace.list(search, category),
    queryFn: () =>
      fetchTemplateMarketplace({
        search: search || undefined,
        category: category || undefined,
      }),
    enabled: Boolean(user?.onboarding_completed),
  });
}

export function useTemplateMarketplaceItem(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.templateMarketplace.detail(id ?? ''),
    queryFn: () => fetchTemplateMarketplaceItem(id!),
    enabled: Boolean(user?.onboarding_completed && id),
  });
}

export function useTemplateMarketplaceMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['template-marketplace'] });
    queryClient.invalidateQueries({ queryKey: ['templates'] });
  };

  const addToLibrary = useMutation({
    mutationFn: addMarketplaceTemplateToLibrary,
    onSuccess: invalidate,
  });

  const preview = useMutation({
    mutationFn: ({
      id,
      variables,
    }: {
      id: string;
      variables?: Record<string, string>;
    }) => previewMarketplaceTemplate(id, { variables }),
  });

  return { addToLibrary, preview };
}
