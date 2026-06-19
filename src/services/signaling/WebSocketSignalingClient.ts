import { io, Socket } from 'socket.io-client';

import { API_BASE_URL } from '@/api/config';

import {
  SignalingClient,
  SignalingHandler,
  SignalingMessage,
  SignalingStatusHandler,
} from './types';

/**
 * Real signaling transport backed by the NestJS socket.io gateway.
 *
 * All messages travel over a single `signal` event whose body is a
 * {@link SignalingMessage}. Connects to the same origin as the REST API by
 * default (override with EXPO_PUBLIC_SIGNALING_URL or the constructor arg).
 *
 * Implements the same `SignalingClient` interface as StubSignalingClient, so
 * swapping the two requires no changes to useWebRTCCall.
 */
export class WebSocketSignalingClient implements SignalingClient {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private userId: string | null = null;
  private readonly url: string;
  private readonly messageHandlers = new Set<SignalingHandler>();
  private readonly statusHandlers = new Set<SignalingStatusHandler>();

  constructor(url?: string) {
    this.url =
      url ?? process.env.EXPO_PUBLIC_SIGNALING_URL?.trim() ?? API_BASE_URL;
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  connect(roomId: string, userId: string): Promise<void> {
    this.roomId = roomId;
    this.userId = userId;
    this.emitStatus('connecting');

    return new Promise<void>((resolve, reject) => {
      const socket = io(this.url, {
        // Prefer raw WebSocket (low latency); fall back to HTTP long-polling
        // if a proxy in front of the backend doesn't support WS upgrades.
        transports: ['websocket', 'polling'],
        tryAllTransports: true,
        forceNew: true,
        reconnectionAttempts: 5,
        timeout: 10_000,
      });
      this.socket = socket;

      socket.on('connect', () => {
        this.emitStatus('connected');
        resolve();
      });

      socket.on('connect_error', (err: Error) => {
        this.emitStatus('error', err);
        reject(err);
      });

      socket.on('disconnect', () => {
        this.emitStatus('disconnected');
      });

      socket.on('signal', (message: SignalingMessage) => {
        this.messageHandlers.forEach((h) => h(message));
      });
    });
  }

  async disconnect(): Promise<void> {
    const socket = this.socket;
    this.socket = null;
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }
    this.roomId = null;
    this.userId = null;
    this.emitStatus('disconnected');
    this.messageHandlers.clear();
    this.statusHandlers.clear();
  }

  send(message: Omit<SignalingMessage, 'roomId'>): void {
    if (!this.socket || !this.roomId) return;
    this.socket.emit('signal', { ...message, roomId: this.roomId });
  }

  onMessage(handler: SignalingHandler): () => void {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onStatus(handler: SignalingStatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  private emitStatus(
    status: Parameters<SignalingStatusHandler>[0],
    error?: Error,
  ): void {
    this.statusHandlers.forEach((h) => h(status, error));
  }
}
