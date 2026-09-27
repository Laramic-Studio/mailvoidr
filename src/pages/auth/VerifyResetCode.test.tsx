import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VerifyResetCode from '@/pages/auth/VerifyResetCode';
import { apiError } from '@/test/axios-errors';

const forgotPassword = vi.fn();
const verifyPasswordResetCode = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('@/lib/api/auth', () => ({
  forgotPassword: (...args: unknown[]) => forgotPassword(...args),
  verifyPasswordResetCode: (...args: unknown[]) => verifyPasswordResetCode(...args),
}));
vi.mock('@/lib/toast', () => ({
  toastSuccess: (...args: unknown[]) => toastSuccess(...args),
  toastError: (...args: unknown[]) => toastError(...args),
}));
vi.mock('@/components/layouts/AuthLayout', () => ({
  AuthLayout: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

function Where() {
  const location = useLocation();
  return <div data-testid="where">{location.pathname + location.search}</div>;
}

function renderPage(url = '/verify-reset-code?email=ada%40example.com') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/verify-reset-code" element={<VerifyResetCode />} />
        <Route path="/reset-password" element={<Where />} />
        <Route path="/forgot-password" element={<Where />} />
      </Routes>
    </MemoryRouter>,
  );
}

const resendButton = () => screen.getByTestId('verify-reset-resend') as HTMLButtonElement;
// The countdown re-arms a one-second timer after every render, so advance one second at a
// time (each inside its own act) instead of jumping — otherwise React batches the updates.
async function tick(seconds: number) {
  if (seconds === 0) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    return;
  }
  for (let i = 0; i < seconds; i += 1) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
  }
}

describe('VerifyResetCode', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    forgotPassword.mockReset().mockResolvedValue(undefined);
    verifyPasswordResetCode.mockReset();
    toastSuccess.mockReset();
    toastError.mockReset();
    return () => vi.useRealTimers();
  });

  it('sends users without an email back to the forgot-password step', () => {
    renderPage('/verify-reset-code');

    expect(screen.getByTestId('where').textContent).toBe('/forgot-password');
  });

  it('starts with the resend button on cooldown, since a code was just sent', () => {
    renderPage();

    expect(resendButton().disabled).toBe(true);
    expect(resendButton().textContent).toBe('Resend code in 60s');
  });

  it('counts down and re-enables resend when the cooldown ends', async () => {
    renderPage();

    await tick(10);
    expect(resendButton().textContent).toBe('Resend code in 50s');

    await tick(50);
    expect(resendButton().disabled).toBe(false);
    expect(resendButton().textContent).toBe('Resend code');
  });

  it('restarts the cooldown after a successful resend', async () => {
    renderPage();
    await tick(60);

    fireEvent.click(resendButton());
    await tick(0);

    expect(forgotPassword).toHaveBeenCalledWith('ada@example.com');
    expect(toastSuccess).toHaveBeenCalled();
    expect(resendButton().disabled).toBe(true);
    expect(resendButton().textContent).toBe('Resend code in 60s');
  });

  it("follows the server's retry_after when it rejects a resend with 429", async () => {
    forgotPassword.mockRejectedValue(apiError(429, { message: 'Please wait 42 seconds.', retry_after: 42 }));
    renderPage();
    await tick(60);

    fireEvent.click(resendButton());
    await tick(0);

    expect(toastError).toHaveBeenCalled();
    expect(resendButton().textContent).toBe('Resend code in 42s');
  });

  it('hands the verified token to the password step', async () => {
    verifyPasswordResetCode.mockResolvedValue('reset token/1');
    renderPage();

    fireEvent.change(screen.getByTestId('verify-reset-otp'), { target: { value: '123456' } });
    fireEvent.submit(screen.getByTestId('verify-reset-form'));
    await tick(0);

    expect(verifyPasswordResetCode).toHaveBeenCalledWith('ada@example.com', '123456');
    expect(screen.getByTestId('where').textContent).toBe(
      '/reset-password?email=ada%40example.com&token=reset%20token%2F1',
    );
  });

  it('stays on the page and reports a wrong code', async () => {
    verifyPasswordResetCode.mockRejectedValue(apiError(422, { message: 'Invalid or expired code.' }));
    renderPage();

    fireEvent.change(screen.getByTestId('verify-reset-otp'), { target: { value: '000000' } });
    fireEvent.submit(screen.getByTestId('verify-reset-form'));
    await tick(0);

    expect(toastError).toHaveBeenCalled();
    expect(screen.queryByTestId('where')).toBeNull();
  });
});
