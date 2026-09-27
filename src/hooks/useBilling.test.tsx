import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBilling } from '@/hooks/useBilling';
import { useWorkspaceStore } from '@/stores/workspace-store';

const fetchBilling = vi.fn();

vi.mock('@/lib/api/billing', () => ({
  fetchBilling: (...args: unknown[]) => fetchBilling(...args),
  confirmBillingCheckout: vi.fn(),
  startBillingCheckout: vi.fn(),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { onboarding_completed: true } }) }));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useBilling', () => {
  beforeEach(() => {
    fetchBilling.mockReset();
    fetchBilling.mockResolvedValue({ plan: { limits: {} } });
    useWorkspaceStore.setState({ workspaceId: 'ws-a', workspace: null });
  });

  // Regression: the hook read a store field that doesn't exist, so every workspace shared
  // one cache entry and switching workspaces kept showing the previous plan and limits.
  it('refetches billing when the selected workspace changes', async () => {
    const { result } = renderHook(() => useBilling(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchBilling).toHaveBeenCalledTimes(1);

    act(() => useWorkspaceStore.setState({ workspaceId: 'ws-b' }));

    await waitFor(() => expect(fetchBilling).toHaveBeenCalledTimes(2));
  });
});
