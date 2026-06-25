import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;
let subscribedUserId: string | null = null;

function resolveSocketOrigin(): string {
  const configured = import.meta.env.VITE_WS_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return 'http://127.0.0.1:3000';
  }

  return window.location.origin;
}

export function getEmailSocket(): Socket {
  if (typeof window === 'undefined') {
    throw new Error('getEmailSocket must run in the browser');
  }

  if (!socket) {
    socket = io(resolveSocketOrigin(), {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 15,
      autoConnect: true,
    });

    socket.on('connect', () => {
      if (subscribedUserId) {
        socket?.emit('join-user-room', subscribedUserId);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('[mailvoidr realtime] connect_error', error.message);
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

  if (!s.connected) {
    s.connect();
  }

  if (s.connected) {
    s.emit('join-user-room', subscribedUserId);
  }
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
