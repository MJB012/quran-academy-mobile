import { useRouter } from 'expo-router';
import React, { ComponentType, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BaseButton from '@/components/base-button/BaseButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Lightweight route entry. Detects whether `react-native-webrtc` is available
 * (it isn't in Expo Go — native modules can only run in a custom dev client),
 * and if not, renders a friendly explainer instead of crashing the route.
 *
 * The actual call UI lives in JoinSessionImpl.tsx and is loaded lazily so its
 * top-level `import { ... } from 'react-native-webrtc'` only runs when the
 * native module is actually present.
 */

function tryLoadImpl(): ComponentType | null {
  try {
    // Native module presence check — throws in Expo Go.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('react-native-webrtc');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('./JoinSessionImpl').default as ComponentType;
  } catch {
    return null;
  }
}

function JoinSession() {
  const [Impl, setImpl] = useState<ComponentType | null | 'loading'>('loading');

  useEffect(() => {
    setImpl(tryLoadImpl());
  }, []);

  if (Impl === 'loading') {
    return <LoadingView />;
  }
  if (Impl === null) {
    return <DevBuildRequiredView />;
  }
  const Component = Impl;
  return <Component />;
}

function LoadingView() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: palette.background }]}
    >
      <View style={styles.center}>
        <ActivityIndicator color={palette.tint} />
      </View>
    </SafeAreaView>
  );
}

function DevBuildRequiredView() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: palette.background }]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: `${palette.tint}22` },
          ]}
        >
          <IconSymbol name="video.fill" size={36} color={palette.tint} />
        </View>

        <Text style={[styles.title, { color: palette.text }]}>
          Video calls need a dev build
        </Text>
        <Text style={[styles.message, { color: palette.textMuted }]}>
          Expo Go can&apos;t load native modules like{' '}
          <Text style={styles.code}>react-native-webrtc</Text>. To test video
          calls, build a development client:
        </Text>

        <View
          style={[
            styles.codeBlock,
            {
              backgroundColor: palette.surfaceAlt,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={[styles.codeText, { color: palette.text }]}>
            npx expo prebuild --clean
          </Text>
          <Text style={[styles.codeText, { color: palette.text }]}>
            npx expo run:android
          </Text>
        </View>

        <Text style={[styles.message, { color: palette.textMuted }]}>
          Once installed, this screen will open the call automatically — the
          rest of the app works normally in Expo Go in the meantime.
        </Text>

        <BaseButton
          title="Back"
          variant="outline"
          size="lg"
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace('/dashboard');
          }}
          containerStyle={styles.backBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  code: {
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  codeBlock: {
    alignSelf: 'stretch',
    borderRadius: Radii.md,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 22,
  },
  backBtn: {
    alignSelf: 'stretch',
    marginTop: Spacing.md,
  },
});

export default JoinSession;
