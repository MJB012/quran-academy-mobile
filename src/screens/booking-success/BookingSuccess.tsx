import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BaseButton from '@/components/base-button/BaseButton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { UserRole } from '@/enums/user-role.enum';
import { useColorScheme } from '@/hooks/use-color-scheme';

function BookingSuccess() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const params = useLocalSearchParams<{
    teacherName?: string;
    date?: string;
    timeSlot?: string;
    duration?: string;
    subject?: string;
    total?: string;
  }>();

  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.5,
            duration: 1500,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(ringOpacity, {
              toValue: 0.4,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(ringOpacity, {
              toValue: 0,
              duration: 1300,
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.timing(ringScale, {
          toValue: 0.8,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity, ringOpacity, ringScale, scale]);

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: palette.background }]}
    >
      <View style={styles.content}>
        <View style={styles.iconStack}>
          <Animated.View
            style={[
              styles.ring,
              {
                borderColor: palette.tint,
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              },
            ]}
          />
          <Animated.View
            style={{
              opacity,
              transform: [{ scale }],
            }}
          >
            <View
              style={[styles.iconCircle, { backgroundColor: palette.tint }]}
            >
              <IconSymbol
                name="checkmark.circle.fill"
                size={72}
                color="#FFFFFF"
              />
            </View>
          </Animated.View>
        </View>

        <Text style={[styles.title, { color: palette.text }]}>
          Booking Confirmed!
        </Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>
          Your session has been successfully booked. You&apos;ll get a
          notification 30 minutes before it starts.
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              shadowColor: scheme === 'dark' ? '#000' : '#0F766E',
            },
          ]}
        >
          <Row
            label="Teacher"
            value={params.teacherName ?? ''}
            palette={palette}
          />
          <Row
            label="Subject"
            value={params.subject ?? ''}
            palette={palette}
          />
          <Row label="Date" value={params.date ?? ''} palette={palette} />
          <Row
            label="Time"
            value={params.timeSlot ?? ''}
            palette={palette}
          />
          <Row
            label="Duration"
            value={`${params.duration ?? ''} min`}
            palette={palette}
          />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: palette.text }]}>
              Paid
            </Text>
            <Text style={[styles.totalValue, { color: palette.tint }]}>
              ${params.total ?? '0.00'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <BaseButton
            title="View Schedule"
            size="lg"
            onPress={() =>
              router.replace({
                pathname: '/schedule',
                params: { role: UserRole.STUDENT },
              })
            }
          />
          <BaseButton
            title="Back to Dashboard"
            size="lg"
            variant="outline"
            onPress={() =>
              router.replace({
                pathname: '/dashboard',
                params: { role: UserRole.STUDENT },
              })
            }
            containerStyle={styles.secondBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: typeof Colors.light;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: palette.textMuted }]}>
        {label}
      </Text>
      <Text
        style={[styles.rowValue, { color: palette.text }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconStack: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0FA678',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  card: {
    alignSelf: 'stretch',
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: 4,
    marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  actions: {
    alignSelf: 'stretch',
  },
  secondBtn: {
    marginTop: Spacing.md,
  },
});

export default BookingSuccess;
