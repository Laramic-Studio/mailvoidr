import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;
let subscribedUserId: string | null = null;

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

function normalizeOrigin(url: string): string {
  return url.trim().replace(/\/$/, '');
}

/** Derive Socket.IO host from VITE_API_URL (api.mailvoidr.com → app.mailvoidr.com). */
function socketOriginFromApiUrl(apiUrl: string | undefined): string | null {
  if (!apiUrl?.trim()) return null;

  try {
    const origin = normalizeOrigin(apiUrl.replace(/\/api\/v1\/?$/i, ''));
    const parsed = new URL(origin);

    if (parsed.hostname.startsWith('api.')) {
      parsed.hostname = parsed.hostname.replace(/^api\./, 'app.');
      return parsed.origin;
    }
  } catch {
    return null;
  }

  return null;
}

export function resolveSocketOrigin(): string {
  if (typeof window === 'undefined') {
    return 'http://127.0.0.1:3030';
  }

  const configured = import.meta.env.VITE_WS_URL?.trim();
  const pageIsLocal = isLocalHost(window.location.hostname);
  const configuredIsLocal = configured
    ? isLocalHost(new URL(configured).hostname)
    : false;

  if (configured && !(configuredIsLocal && !pageIsLocal)) {
    return normalizeOrigin(configured);
  }

  if (configuredIsLocal && !pageIsLocal) {
    console.warn(
      '[mailvoidr realtime] VITE_WS_URL points at localhost but the app is on',
      window.location.origin,
      '— rebuild with VITE_WS_URL=https://app.mailvoidr.com (or your SMTP host).',
    );
  }

  const fromApi = socketOriginFromApiUrl(import.meta.env.VITE_API_URL);
  if (fromApi) {
    return fromApi;
  }

  if (import.meta.env.DEV) {
    return normalizeOrigin(configured ?? 'http://127.0.0.1:3030');
  }

  return window.location.origin;
}

export function getEmailSocket(): Socket {
  if (typeof window === 'undefined') {
    throw new Error('getEmailSocket must run in the browser');
  }

  if (!socket) {
    const origin = resolveSocketOrigin();

    socket = io(origin, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 15,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.info('[mailvoidr realtime] connected', origin);
      if (subscribedUserId) {
        socket?.emit('join-user-room', subscribedUserId);
      }
    });

    socket.on('connect_error', (error) => {
      console.error(
        '[mailvoidr realtime] connect_error',
        error.message,
        '— check VITE_WS_URL, smtp HTTP_PORT, nginx /socket.io/ proxy, and WS_CORS_ORIGINS on the server',
      );
    });
  }

  return socket;
}

export function joinUserRoom(userId: string | number): void {
  if (typeof window === 'undefined') {
    return;
  }

  subscribedUserId = userId.toString();
  const s = getEmailSocket();

  const emitJoin = () => {
    s.emit('join-user-room', subscribedUserId);
  };

  if (s.connected) {
    emitJoin();
    return;
  }

  s.once('connect', emitJoin);
  s.connect();
}

export function disconnectEmailSocket(): void {
  subscribedUserId = null;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export type NewEmailPayload = {
  id: string;
  type?: 'virtual';
  virtual_email_id?: string;
};
