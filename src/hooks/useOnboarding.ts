import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeOnboarding,
  createOnboardingApiKey,
  createOnboardingWorkspace,
  fetchOnboardingStatus,
  saveOnboardingStep,
  updateOnboardingWorkspace,
} from "@/lib/api/onboarding";
import { queryKeys } from "@/lib/query-keys";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function useOnboardingStatus() {
  return useQuery({
    queryKey: queryKeys.onboarding.status,
    queryFn: fetchOnboardingStatus,
  });
}

export function useOnboardingMutations() {
  const queryClient = useQueryClient();
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.status });
    void queryClient.invalidateQueries({ queryKey: queryKeys.me });
  };

  const saveStep = useMutation({
    mutationFn: saveOnboardingStep,
    onSuccess: invalidate,
  });

  const createWorkspace = useMutation({
    mutationFn: createOnboardingWorkspace,
    onSuccess: ({ workspace }) => {
      setWorkspace(workspace);
      invalidate();
    },
  });

  const updateWorkspace = useMutation({
    mutationFn: updateOnboardingWorkspace,
    onSuccess: ({ workspace }) => {
      setWorkspace(workspace);
      invalidate();
    },
  });

  const createApiKey = useMutation({
    mutationFn: (name?: string) => createOnboardingApiKey(name),
  });

  const complete = useMutation({
    mutationFn: async () => {
      const result = await completeOnboarding();
      await queryClient.refetchQueries({ queryKey: queryKeys.me });
      return result;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.status });
    },
  });

  return {
    saveStep,
    createWorkspace,
    updateWorkspace,
    createApiKey,
    complete,
  };
}
