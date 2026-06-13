import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Logo from '@/components/logo/Logo';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface LoadingProps {
  message?: string;
}

function Loading({ message = 'Loading...' }: LoadingProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: palette.background }]}
    >
      <View style={styles.content}>
        <Logo size="xl" />
        <Text style={[styles.appName, { color: palette.tint }]}>
          Quran Academy
        </Text>
        <ActivityIndicator
          size="large"
          color={palette.tint}
          style={styles.spinner}
        />
        <Text style={[styles.message, { color: palette.textMuted }]}>
          {message}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  spinner: {
    marginTop: Spacing.xl,
  },
  message: {
    marginTop: Spacing.md,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default Loading;
