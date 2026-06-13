import {
  SignalingClient,
  SignalingHandler,
  SignalingMessage,
  SignalingStatusHandler,
} from './types';

/**
 * StubSignalingClient — used while the real backend is not yet built.
 *
 * It accepts all calls, logs everything to the console, and never delivers
 * any inbound messages from a remote peer. The UI can therefore render in
 * "waiting for peer" state forever without crashing.
 *
 * When the real signaling backend is ready, swap this for a
 * WebSocketSignalingClient (or FirebaseSignalingClient) that implements the
 * same `SignalingClient` interface — no other code in the app needs to change.
 */
export class StubSignalingClient implements SignalingClient {
  private roomId: string | null = null;
  private userId: string | null = null;
  private connected = false;
  private messageHandlers = new Set<SignalingHandler>();
  private statusHandlers = new Set<SignalingStatusHandler>();

  get isConnected(): boolean {
    return this.connected;
  }

  async connect(roomId: string, userId: string): Promise<void> {
    this.roomId = roomId;
    this.userId = userId;
    this.connected = true;
    this.emitStatus('connecting');
    // Simulate a tiny "connected" tick so the UI can transition out of the
    // initial connecting state.
    setTimeout(() => {
      if (this.connected) this.emitStatus('connected');
    }, 200);
    if (__DEV__) {
      console.log(
        `[StubSignaling] connected to room ${roomId} as ${userId} (no backend yet)`,
      );
    }
  }

  async disconnect(): Promise<void> {
    if (__DEV__ && this.connected) {
      console.log(
        `[StubSignaling] disconnected from ${this.roomId} (was ${this.userId})`,
      );
    }
    this.connected = false;
    this.roomId = null;
    this.userId = null;
    this.emitStatus('disconnected');
    this.messageHandlers.clear();
    this.statusHandlers.clear();
  }

  send(message: Omit<SignalingMessage, 'roomId'>): void {
    if (!this.connected || !this.roomId) {
      if (__DEV__) {
        console.warn('[StubSignaling] send() called before connect()');
      }
      return;
    }
    const full: SignalingMessage = { ...message, roomId: this.roomId };
    if (__DEV__) {
      // Useful for verifying the WebRTC negotiation is producing what you'd
      // expect to send to the real signaling server.
      console.log('[StubSignaling] would send →', full.type, full);
    }
    // No echo, no remote — stub does not deliver any inbound message.
  }

  onMessage(handler: SignalingHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatus(handler: SignalingStatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  private emitStatus(
    status: Parameters<SignalingStatusHandler>[0],
    error?: Error,
  ): void {
    this.statusHandlers.forEach((h) => h(status, error));
  }
}
