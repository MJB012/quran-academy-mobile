import { useCallback, useEffect, useRef, useState } from 'react';
import {
  MediaStream,
  MediaStreamTrack,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
  mediaDevices,
} from 'react-native-webrtc';

import { SignalingClient } from '@/services/signaling/types';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export type CallStatus =
  | 'idle'
  | 'requesting-permissions'
  | 'waiting-for-peer'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface UseWebRTCCallOptions {
  roomId: string;
  userId: string;
  signalingClient: SignalingClient;
}

export interface UseWebRTCCallReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  status: CallStatus;
  error: string | null;
  isMuted: boolean;
  isCameraOff: boolean;
  toggleMute: () => void;
  toggleCamera: () => void;
  switchCamera: () => void;
  hangUp: () => Promise<void>;
}

/**
 * Manages a 1-on-1 WebRTC call:
 *  - Acquires camera + mic via getUserMedia
 *  - Builds an RTCPeerConnection with public STUN servers
 *  - Wires inbound/outbound signaling messages to the peer connection
 *  - Exposes call controls (mute, camera toggle, switch camera, hang up)
 *
 * The signaling transport is injected — pass any object that satisfies
 * `SignalingClient`. With the StubSignalingClient the local UI works in
 * "waiting for peer" state forever; with a real client the peer connects.
 */
export function useWebRTCCall({
  roomId,
  userId,
  signalingClient,
}: UseWebRTCCallOptions): UseWebRTCCallReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState<CallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const cleanedUpRef = useRef(false);

  const cleanup = useCallback(async () => {
    if (cleanedUpRef.current) return;
    cleanedUpRef.current = true;
    try {
      pcRef.current?.close();
    } catch {
      // ignore
    }
    pcRef.current = null;
    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    }
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    try {
      await signalingClient.disconnect();
    } catch {
      // ignore
    }
  }, [signalingClient]);

  useEffect(() => {
    let unmounted = false;
    cleanedUpRef.current = false;

    const init = async () => {
      try {
        setStatus('requesting-permissions');

        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
        });

        if (unmounted) {
          (stream as MediaStream)
            .getTracks()
            .forEach((t: MediaStreamTrack) => t.stop());
          return;
        }

        localStreamRef.current = stream as MediaStream;
        setLocalStream(stream as MediaStream);

        const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
        pcRef.current = pc;

        (stream as MediaStream)
          .getTracks()
          .forEach((track: MediaStreamTrack) => {
            pc.addTrack(track, stream as MediaStream);
          });

        // Remote track received — show remote video.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (pc as any).addEventListener('track', (event: any) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0] as MediaStream);
          }
        });

        // Local ICE candidate — relay to peer via signaling.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (pc as any).addEventListener('icecandidate', (event: any) => {
          if (event.candidate) {
            signalingClient.send({
              type: 'ice-candidate',
              from: userId,
              payload: event.candidate.toJSON
                ? event.candidate.toJSON()
                : event.candidate,
            });
          }
        });

        // Connection state — drive UI status.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (pc as any).addEventListener('connectionstatechange', () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cs = (pc as any).connectionState as string;
          if (unmounted) return;
          if (cs === 'connected') setStatus('connected');
          else if (cs === 'connecting') setStatus('connecting');
          else if (cs === 'disconnected' || cs === 'failed' || cs === 'closed')
            setStatus('disconnected');
        });

        await signalingClient.connect(roomId, userId);
        signalingClient.send({ type: 'join', from: userId });

        if (!unmounted) setStatus('waiting-for-peer');
      } catch (e) {
        console.error('[useWebRTCCall] init failed', e);
        if (!unmounted) {
          const msg = e instanceof Error ? e.message : 'Failed to start call';
          setError(msg);
          setStatus('error');
        }
      }
    };

    void init();

    const unsubMessage = signalingClient.onMessage(async (message) => {
      const pc = pcRef.current;
      if (!pc) return;
      // Ignore messages we sent ourselves (some servers echo back).
      if (message.from && message.from === userId) return;

      try {
        switch (message.type) {
          case 'peer-joined': {
            // Existing peer creates the offer when a new peer joins.
            setStatus('connecting');
            const offer = await pc.createOffer({});
            await pc.setLocalDescription(offer);
            signalingClient.send({
              type: 'offer',
              from: userId,
              to: message.from,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              payload: offer as any,
            });
            break;
          }
          case 'offer': {
            setStatus('connecting');
            await pc.setRemoteDescription(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              new RTCSessionDescription(message.payload as any),
            );
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            signalingClient.send({
              type: 'answer',
              from: userId,
              to: message.from,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              payload: answer as any,
            });
            break;
          }
          case 'answer': {
            await pc.setRemoteDescription(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              new RTCSessionDescription(message.payload as any),
            );
            break;
          }
          case 'ice-candidate': {
            await pc.addIceCandidate(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              new RTCIceCandidate(message.payload as any),
            );
            break;
          }
          case 'peer-left': {
            setRemoteStream(null);
            setStatus('disconnected');
            break;
          }
          default:
            break;
        }
      } catch (e) {
        console.error('[useWebRTCCall] signaling message error', e);
      }
    });

    return () => {
      unmounted = true;
      unsubMessage();
      void cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, userId]);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    let nextMuted = false;
    stream.getAudioTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = !track.enabled;
      nextMuted = !track.enabled;
    });
    setIsMuted(nextMuted);
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    let nextOff = false;
    stream.getVideoTracks().forEach((track: MediaStreamTrack) => {
      track.enabled = !track.enabled;
      nextOff = !track.enabled;
    });
    setIsCameraOff(nextOff);
  }, []);

  const switchCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((track: MediaStreamTrack) => {
      // react-native-webrtc exposes _switchCamera on video tracks.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const t = track as any;
      if (typeof t._switchCamera === 'function') t._switchCamera();
    });
  }, []);

  const hangUp = useCallback(async () => {
    try {
      signalingClient.send({ type: 'leave', from: userId });
    } catch {
      // ignore
    }
    await cleanup();
    setStatus('disconnected');
  }, [cleanup, signalingClient, userId]);

  return {
    localStream,
    remoteStream,
    status,
    error,
    isMuted,
    isCameraOff,
    toggleMute,
    toggleCamera,
    switchCamera,
    hangUp,
  };
}
