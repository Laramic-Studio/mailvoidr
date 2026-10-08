import { StrictMode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ConfirmPage, { safeRedirectUrl } from '@/pages/public/ConfirmPage';
import { apiError } from '@/test/axios-errors';
import * as publicApi from '@/lib/api/newsletter-public';

vi.mock('@/lib/api/newsletter-public', () => ({
  submitPublicConfirm: vi.fn(),
  fetchPublicConfirm: vi.fn(),
  resendPublicConfirm: vi.fn(),
  publicNewsletterAction: (path: string) => `http://api.test/api/v1${path}`,
}));

const submit = vi.mocked(publicApi.submitPublicConfirm);
const fetchGet = vi.mocked(publicApi.fetchPublicConfirm);
const resend = vi.mocked(publicApi.resendPublicConfirm);

const TOKEN = 'a'.repeat(48);

function confirmState(outcome: string, extra: Record<string, unknown> = {}) {
  return { outcome, tenant_name: 'Acme', logo_url: null, message: null, redirect_url: null, ...extra };
}

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <StrictMode>
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/confirm/invalid" element={<ConfirmPage />} />
            <Route path="/confirm/:token" element={<ConfirmPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
}

describe('ConfirmPage', () => {
  beforeEach(() => {
    submit.mockReset();
    fetchGet.mockReset();
    resend.mockReset();
  });

  it('POSTs the confirm exactly once under StrictMode and shows success', async () => {
    submit.mockResolvedValue(confirmState('confirmed', { redirect_url: 'https://acme.test/welcome' }));
    renderAt(`/confirm/${TOKEN}`);

    expect(screen.getByText('Confirming your subscription…')).toBeTruthy();
    expect(await screen.findByText('You are confirmed')).toBeTruthy();
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith(TOKEN);
    expect(fetchGet).not.toHaveBeenCalled();
    const link = screen.getByRole('link', { name: 'Continue' });
    expect(link.getAttribute('href')).toBe('https://acme.test/welcome');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('shows the already-confirmed state', async () => {
    submit.mockResolvedValue(confirmState('already_confirmed'));
    renderAt(`/confirm/${TOKEN}`);
    expect(await screen.findByText('You are already confirmed')).toBeTruthy();
  });

  it('never renders a non-http redirect_url', async () => {
    submit.mockResolvedValue(confirmState('confirmed', { redirect_url: 'javascript:alert(1)' }));
    renderAt(`/confirm/${TOKEN}`);
    expect(await screen.findByText('You are confirmed')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Continue' })).toBeNull();
  });

  it('shows the expired state with a working resend when the POST says expired', async () => {
    submit.mockResolvedValue(confirmState('expired'));
    resend.mockResolvedValue({ message: 'A new link is on the way.' });
    renderAt(`/confirm/${TOKEN}`);

    expect(await screen.findByText('This link has expired')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Send a new link' }));
    expect(await screen.findByText('A new link is on the way.')).toBeTruthy();
    expect(resend).toHaveBeenCalledWith(TOKEN);
  });

  it('shows the generic broken state when the token is unknown (404)', async () => {
    submit.mockRejectedValue(apiError(404, { message: 'This link does not work.' }));
    renderAt(`/confirm/${TOKEN}`);
    expect(await screen.findByText('This link does not work')).toBeTruthy();
  });

  it('shows the API error message for other failures', async () => {
    submit.mockRejectedValue(apiError(429, { message: 'Too Many Attempts.' }));
    renderAt(`/confirm/${TOKEN}`);
    expect(await screen.findByText('Too Many Attempts.')).toBeTruthy();
  });

  it('treats /confirm/invalid?error=expired as expired and never POSTs', async () => {
    renderAt('/confirm/invalid?error=expired');
    expect(await screen.findByText('This link has expired')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Send a new link' })).toBeNull();
    await waitFor(() => expect(submit).not.toHaveBeenCalled());
  });

  it('shows the generic state for /confirm/invalid and unknown errors, without POSTing', async () => {
    renderAt('/confirm/invalid');
    expect(await screen.findByText('This link does not work')).toBeTruthy();
    renderAt('/confirm/invalid?error=something-else');
    expect((await screen.findAllByText('This link does not work')).length).toBe(2);
    expect(submit).not.toHaveBeenCalled();
  });
});

describe('safeRedirectUrl', () => {
  it('keeps http(s) and drops everything else', () => {
    expect(safeRedirectUrl('https://a.test/x')).toBe('https://a.test/x');
    expect(safeRedirectUrl('http://a.test/')).toBe('http://a.test/');
    expect(safeRedirectUrl('javascript:alert(1)')).toBeNull();
    expect(safeRedirectUrl('/relative')).toBeNull();
    expect(safeRedirectUrl(null)).toBeNull();
  });
});
