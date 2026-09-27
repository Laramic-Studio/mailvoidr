import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { QueryErrorState } from '@/components/QueryErrorState';
import { apiError, networkError } from '@/test/axios-errors';

function renderState(props: Partial<React.ComponentProps<typeof QueryErrorState>> = {}) {
  return render(
    <MemoryRouter>
      <QueryErrorState error={new Error('boom')} subject="webhook endpoints" {...props} />
    </MemoryRouter>,
  );
}

describe('QueryErrorState', () => {
  it('explains a plan limit (402) with the API message and a link to billing', () => {
    renderState({
      error: apiError(402, { message: 'Webhooks are not available on your plan. Upgrade to Starter or above.' }),
    });

    expect(screen.getByText('Not included in your plan')).toBeTruthy();
    expect(screen.getByText(/Webhooks are not available on your plan/)).toBeTruthy();
    expect(screen.getByRole('link', { name: 'View plans' }).getAttribute('href')).toBe('/dashboard/billing');
  });

  it('explains missing permission (403) without offering a retry', () => {
    renderState({ error: apiError(403, { message: 'This action is unauthorized.' }), onRetry: vi.fn() });

    expect(screen.getByText("You can't view webhook endpoints")).toBeTruthy();
    expect(screen.queryByRole('button', { name: /try again/i })).toBeNull();
  });

  it('tells the user when the connection is the problem', () => {
    renderState({ error: networkError(), onRetry: vi.fn() });

    expect(screen.getByText("Can't reach Mailvoidr")).toBeTruthy();
  });

  it('shows a generic failure with a working retry for server errors', () => {
    const onRetry = vi.fn();
    renderState({ error: apiError(500, { message: 'Server Error' }), onRetry });

    expect(screen.getByText('Could not load webhook endpoints')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('disables the retry button while a retry is in flight', () => {
    renderState({ error: apiError(500), onRetry: vi.fn(), retrying: true });

    const button = screen.getByRole('button', { name: 'Retrying…' }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('omits the retry button when no handler is given', () => {
    renderState({ error: apiError(500) });

    expect(screen.queryByRole('button')).toBeNull();
  });
});
