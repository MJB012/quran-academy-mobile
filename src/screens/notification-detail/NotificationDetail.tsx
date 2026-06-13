import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import BaseButton from '@/components/base-button/BaseButton';
import ScreenHeader from '@/components/screen-header/ScreenHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type NotifIcon =
  | 'calendar.badge.clock'
  | 'creditcard.fill'
  | 'star.fill'
  | 'person.fill'
  | 'envelope.fill'
  | 'checkmark.circle.fill'
  | 'bell.fill';

const ICON_WHITELIST: NotifIcon[] = [
  'calendar.badge.clock',
  'creditcard.fill',
  'star.fill',
  'person.fill',
  'envelope.fill',
  'checkmark.circle.fill',
  'bell.fill',
];

function asNotifIcon(value: string | undefined): NotifIcon {
  return ICON_WHITELIST.includes(value as NotifIcon)
    ? (value as NotifIcon)
    : 'bell.fill';
}

function NotificationDetail() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();

  const params = useLocalSearchParams<{
    id?: string;
    title?: string;
    message?: string;
    time?: string;
    icon?: string;
    tint?: string;
  }>();

  const title = params.title ?? 'Notification';
  const message = params.message ?? '';
  const time = params.time ?? '';
  const icon = asNotifIcon(params.icon);
  const tint = params.tint && /^#[0-9A-Fa-f]{6}$/.test(params.tint)
    ? params.tint
    : palette.tint;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={palette.tint} />
      <ScreenHeader title="Notification" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
          <View style={[styles.iconWrap, { backgroundColor: `${tint}22` }]}>
            <IconSymbol name={icon} size={36} color={tint} />
          </View>

          <Text style={[styles.title, { color: palette.text }]}>{title}</Text>

          {time ? (
            <View style={styles.timeRow}>
              <IconSymbol
                name="clock.fill"
                size={13}
                color={palette.textMuted}
              />
              <Text style={[styles.time, { color: palette.textMuted }]}>
                {time}
              </Text>
            </View>
          ) : null}

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
            Description
          </Text>
          <Text style={[styles.message, { color: palette.text }]}>
            {message}
          </Text>
        </View>

        <BaseButton
          title="Back to Notifications"
          variant="outline"
          size="lg"
          onPress={() => {
            if (router.canGoBack()) router.back();
          }}
          containerStyle={styles.backButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 28,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  time: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    alignSelf: 'stretch',
    marginVertical: Spacing.lg,
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  message: {
    alignSelf: 'stretch',
    fontSize: 15,
    lineHeight: 24,
  },
  backButton: {
    marginTop: Spacing.xl,
  },
});

export default NotificationDetail;
