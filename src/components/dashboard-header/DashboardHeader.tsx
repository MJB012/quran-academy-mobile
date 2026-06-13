import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface DashboardHeaderProps {
  userName: string;
  notificationCount?: number;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  onCalendarPress?: () => void;
  onLogoutPress?: () => void;
}

function DashboardHeader({
  userName,
  notificationCount = 0,
  onNotificationsPress,
  onProfilePress,
  onCalendarPress,
  onLogoutPress,
}: DashboardHeaderProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: palette.tint,
          paddingTop: insets.top + Spacing.md,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          <View style={styles.logoBox}>
            <IconSymbol name="book.fill" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.appName} numberOfLines={1}>
              Quran Academy
            </Text>
            <Text style={styles.welcome} numberOfLines={1}>
              Welcome, {userName}
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <HeaderIcon
            name="bell.fill"
            onPress={onNotificationsPress}
            badge={notificationCount}
          />
          <HeaderIcon name="person.fill" onPress={onProfilePress} />
          <HeaderIcon name="calendar" onPress={onCalendarPress} />
          <HeaderIcon name="power" onPress={onLogoutPress} />
        </View>
      </View>
    </View>
  );
}

function HeaderIcon({
  name,
  onPress,
  badge = 0,
}: {
  name: 'bell.fill' | 'person.fill' | 'calendar' | 'power';
  onPress?: () => void;
  badge?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.iconWrap,
        { opacity: pressed ? 0.6 : 1 },
      ]}
      accessibilityRole="button"
    >
      <IconSymbol name={name} size={22} color="#FFFFFF" />
      {badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flexShrink: 1,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  welcome: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default DashboardHeader;
