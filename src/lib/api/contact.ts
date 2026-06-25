const API_URL = import.meta.env.VITE_API_URL ?? 'http://ui.test/api/v1';

export interface ContactFormPayload {
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  volume?: string;
  message: string;
}

export async function submitContactForm(payload: ContactFormPayload): Promise<string> {
  const response = await fetch(`${API_URL}/contact`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof body?.message === 'string'
        ? body.message
        : 'Unable to send your message. Please try again.';
    throw new Error(message);
  }

  return body.message as string;
}
