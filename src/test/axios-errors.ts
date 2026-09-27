import { AxiosError, type AxiosResponse } from 'axios';

/** Builds an AxiosError shaped like a real API failure, for tests. */
export function apiError(status: number, data: unknown = {}): AxiosError {
  const response = { status, data, statusText: '', headers: {}, config: {} } as AxiosResponse;
  return new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', undefined, undefined, response);
}

/** An AxiosError with no response — what a dropped connection looks like. */
export function networkError(): AxiosError {
  return new AxiosError('Network Error', 'ERR_NETWORK');
}
