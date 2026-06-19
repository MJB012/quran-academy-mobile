import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '@/components/avatar/Avatar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radii, Spacing } from '@/constants/theme';
import { useWebRTCCall } from '@/hooks/use-webrtc-call';
import { WebSocketSignalingClient } from '@/services/signaling/WebSocketSignalingClient';

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

function JoinSessionImpl() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    sessionId?: string;
    counterpartName?: string;
    subject?: string;
    userId?: string;
  }>();

  const sessionId = params.sessionId ?? 'default-session';
  const counterpartName = params.counterpartName ?? 'Your peer';
  const subject = params.subject ?? '';
  const userId = params.userId ?? `user-${Math.random().toString(36).slice(2, 8)}`;

  const signalingClient = useMemo(() => new WebSocketSignalingClient(), []);

  const {
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
  } = useWebRTCCall({ roomId: sessionId, userId, signalingClient });

  // Pulsing avatar while waiting for peer.
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (remoteStream) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, remoteStream]);

  // Call timer (starts ticking once connected).
  const [elapsed, setElapsed] = React.useState(0);
  useEffect(() => {
    if (status !== 'connected') return;
    const start = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [status]);

  const handleHangUp = async () => {
    await hangUp();
    if (router.canGoBack()) router.back();
    else router.replace('/dashboard');
  };

  const statusLabel = (() => {
    switch (status) {
      case 'idle':
      case 'requesting-permissions':
        return 'Requesting camera & mic...';
      case 'waiting-for-peer':
        return `Waiting for ${counterpartName}...`;
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return formatElapsed(elapsed);
      case 'disconnected':
        return 'Call ended';
      case 'error':
        return error ?? 'Something went wrong';
      default:
        return '';
    }
  })();

  const showLocalPip = !!localStream && !isCameraOff;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Remote video / placeholder */}
      {remoteStream ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={StyleSheet.absoluteFillObject}
          objectFit="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <Animated.View style={{ transform: [{ scale: pulse }] }}>
            <Avatar name={counterpartName} size="xl" />
          </Animated.View>
          <Text style={styles.placeholderName}>{counterpartName}</Text>
          {subject ? (
            <Text style={styles.placeholderSubject}>{subject}</Text>
          ) : null}
          {status === 'requesting-permissions' ||
          status === 'waiting-for-peer' ||
          status === 'connecting' ? (
            <ActivityIndicator
              color="#FFFFFF"
              size="small"
              style={styles.placeholderSpinner}
            />
          ) : null}
        </View>
      )}

      {/* Top status pill */}
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + Spacing.sm },
        ]}
      >
        <View style={styles.statusPill}>
          {status === 'connected' ? <View style={styles.liveDot} /> : null}
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>

      {/* Local PiP */}
      {showLocalPip && localStream ? (
        <View
          style={[
            styles.pipWrap,
            { top: insets.top + 64 },
          ]}
        >
          <RTCView
            streamURL={localStream.toURL()}
            style={styles.pipVideo}
            objectFit="cover"
            mirror
            zOrder={1}
          />
          <Pressable
            onPress={switchCamera}
            hitSlop={6}
            style={styles.pipFlip}
            accessibilityLabel="Switch camera"
          >
            <IconSymbol
              name="arrow.triangle.2.circlepath.camera"
              size={14}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      ) : null}

      {/* Bottom controls */}
      <View
        style={[
          styles.controls,
          { paddingBottom: insets.bottom + Spacing.lg },
        ]}
      >
        <ControlButton
          icon={isMuted ? 'mic.slash.fill' : 'mic.fill'}
          onPress={toggleMute}
          active={isMuted}
          accessibilityLabel={isMuted ? 'Unmute' : 'Mute'}
        />
        <ControlButton
          icon={isCameraOff ? 'video.slash.fill' : 'video.fill'}
          onPress={toggleCamera}
          active={isCameraOff}
          accessibilityLabel={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
        />
        <ControlButton
          icon="phone.down.fill"
          onPress={handleHangUp}
          variant="danger"
          accessibilityLabel="End call"
        />
      </View>
    </View>
  );
}

function ControlButton({
  icon,
  onPress,
  variant = 'default',
  active = false,
  accessibilityLabel,
}: {
  icon:
    | 'mic.fill'
    | 'mic.slash.fill'
    | 'video.fill'
    | 'video.slash.fill'
    | 'phone.down.fill';
  onPress: () => void;
  variant?: 'default' | 'danger';
  active?: boolean;
  accessibilityLabel: string;
}) {
  const isDanger = variant === 'danger';
  const bg = isDanger
    ? '#DC2626'
    : active
      ? '#FFFFFF'
      : 'rgba(255,255,255,0.15)';
  const fg = isDanger ? '#FFFFFF' : active ? '#0F172A' : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.controlBtn,
        {
          backgroundColor: bg,
          opacity: pressed ? 0.8 : 1,
          shadowColor: isDanger ? '#991B1B' : '#000',
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <IconSymbol name={icon} size={26} color={fg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  placeholderName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: Spacing.lg,
  },
  placeholderSubject: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  placeholderSpinner: {
    marginTop: Spacing.lg,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: Spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radii.pill,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  pipWrap: {
    position: 'absolute',
    right: Spacing.lg,
    width: 110,
    height: 160,
    borderRadius: Radii.lg,
    overflow: 'hidden',
    backgroundColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  pipVideo: {
    width: '100%',
    height: '100%',
  },
  pipFlip: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default JoinSessionImpl;
