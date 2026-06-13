import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Logo from '@/components/logo/Logo';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface SplashProps {
  onDone?: () => void;
  holdMs?: number;
}

function Splash({ onDone, holdMs = 700 }: SplashProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(16)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const entry = Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslate, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.delay(holdMs),
    ]);

    const pulseRing = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.6,
            duration: 1600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ringOpacity, {
              toValue: 0.55,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              toValue: 0,
              duration: 1400,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(ringScale, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    const pulseDot = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0.3,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      );

    const dotsLoop = Animated.parallel([
      pulseDot(dot1, 0),
      pulseDot(dot2, 180),
      pulseDot(dot3, 360),
    ]);

    pulseRing.start();
    dotsLoop.start();
    entry.start(({ finished }) => {
      if (finished) onDone?.();
    });

    return () => {
      pulseRing.stop();
      dotsLoop.stop();
      entry.stop();
    };
  }, [
    dot1,
    dot2,
    dot3,
    holdMs,
    logoOpacity,
    logoScale,
    onDone,
    ringOpacity,
    ringScale,
    taglineOpacity,
    titleOpacity,
    titleTranslate,
  ]);

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: palette.background }]}
    >
      <View
        style={[
          styles.decorCircle,
          styles.decorTopRight,
          { backgroundColor: `${palette.tint}22` },
        ]}
      />
      <View
        style={[
          styles.decorCircle,
          styles.decorBottomLeft,
          { backgroundColor: `${palette.tint}18` },
        ]}
      />

      <View style={styles.content}>
        <View style={styles.logoWrap}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderColor: palette.tint,
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }}
          >
            <Logo size="xl" />
          </Animated.View>
        </View>

        <Animated.Text
          style={[
            styles.appName,
            {
              color: palette.tint,
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslate }],
            },
          ]}
        >
          Quran Academy
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            { color: palette.textMuted, opacity: taglineOpacity },
          ]}
        >
          Learn from Expert Teachers
        </Animated.Text>
      </View>

      <View style={styles.dots}>
        {[dot1, dot2, dot3].map((val, i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: palette.tint,
                opacity: val,
                transform: [
                  {
                    scale: val.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  decorCircle: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  decorTopRight: { top: -120, right: -120 },
  decorBottomLeft: { bottom: -160, left: -160 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  pulseRing: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: Radii.xl,
    borderWidth: 2,
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: Spacing.xxl,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default Splash;
