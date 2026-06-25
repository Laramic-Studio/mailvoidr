import type { DomainListResponse, VerifiedDomain } from '@/types';
import { api } from '@/lib/api';

export async function fetchDomains(): Promise<DomainListResponse> {
  const { data } = await api.get<DomainListResponse>('/domains');
  return data;
}

export async function fetchDomain(id: string): Promise<{ domain: VerifiedDomain }> {
  const { data } = await api.get<{ domain: VerifiedDomain }>(`/domains/${id}`);
  return data;
}

export async function createDomain(domain: string): Promise<{
  domain: VerifiedDomain;
  message: string;
}> {
  const { data } = await api.post<{ domain: VerifiedDomain; message: string }>('/domains', {
    domain,
  });
  return data;
}

export async function verifyDomain(id: string): Promise<{
  domain: VerifiedDomain;
  message: string;
}> {
  const { data } = await api.post<{ domain: VerifiedDomain; message: string }>(
    `/domains/${id}/verify`,
  );
  return data;
}

export async function deleteDomain(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/domains/${id}`);
  return data;
}
