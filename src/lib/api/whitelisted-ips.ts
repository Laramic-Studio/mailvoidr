import type { WhitelistedIpListResponse, WhitelistedSendingIp } from '@/types';
import { api } from '@/lib/api';

export async function fetchWhitelistedIps(): Promise<WhitelistedIpListResponse> {
  const { data } = await api.get<WhitelistedIpListResponse>('/whitelisted-ips');
  return data;
}

export async function createWhitelistedIp(payload: {
  ip_address: string;
  label?: string | null;
}): Promise<{ ip: WhitelistedSendingIp; message: string }> {
  const { data } = await api.post<{ ip: WhitelistedSendingIp; message: string }>(
    '/whitelisted-ips',
    payload,
  );
  return data;
}

export async function deleteWhitelistedIp(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/whitelisted-ips/${id}`);
  return data;
}
