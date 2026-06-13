/**
 * Wire format for signaling messages exchanged between peers.
 * Designed so the same JSON can be relayed over any transport
 * (WebSocket, Firebase, Supabase, etc.) — only the transport adapter changes.
 */

export type SignalingMessageType =
  | 'join'
  | 'leave'
  | 'peer-joined'
  | 'peer-left'
  | 'offer'
  | 'answer'
  | 'ice-candidate';

export interface SignalingMessage {
  type: SignalingMessageType;
  roomId: string;
  /** ID of the user sending the message */
  from?: string;
  /** Optional target user ID (for direct addressing) */
  to?: string;
  /** Free-form payload — SDP, ICE candidate, etc. */
  payload?: unknown;
}

export type SignalingHandler = (message: SignalingMessage) => void;
export type SignalingStatusHandler = (
  status: 'connecting' | 'connected' | 'disconnected' | 'error',
  error?: Error,
) => void;

export interface SignalingClient {
  /** Open the transport and join a room. */
  connect(roomId: string, userId: string): Promise<void>;
  /** Leave the room and close the transport. */
  disconnect(): Promise<void>;
  /** Send a signaling message to the room (server fans out). */
  send(message: Omit<SignalingMessage, 'roomId'>): void;
  /** Subscribe to incoming messages. Returns an unsubscribe fn. */
  onMessage(handler: SignalingHandler): () => void;
  /** Subscribe to connection status changes. Returns an unsubscribe fn. */
  onStatus(handler: SignalingStatusHandler): () => void;
  /** Whether the client currently considers itself connected. */
  readonly isConnected: boolean;
}
