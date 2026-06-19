import { useEffect } from 'react';
import { io } from 'socket.io-client';

import { API_BASE_URL } from '@/api/config';

/**
 * Subscribes to the backend `/teachers` socket.io namespace and invokes
 * `onChanged` whenever the verified-teacher list changes (a teacher onboards,
 * edits their profile, or verifies their email). Pass a stable callback
 * (useCallback) so the socket isn't torn down on every render.
 */
export function useTeachersRealtime(onChanged: () => void): void {
  useEffect(() => {
    const url =
      process.env.EXPO_PUBLIC_SIGNALING_URL?.trim() ?? API_BASE_URL;
    const socket = io(`${url}/teachers`, {
      transports: ['websocket', 'polling'],
      tryAllTransports: true,
      forceNew: true,
      reconnectionAttempts: 5,
    });
    socket.on('changed', onChanged);
    return () => {
      socket.off('changed', onChanged);
      socket.disconnect();
    };
  }, [onChanged]);
}
