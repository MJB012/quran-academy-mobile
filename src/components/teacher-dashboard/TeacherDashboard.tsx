import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  BookingsService,
  NotificationsService,
  bookingPartyName,
  type Booking,
} from '@/api';
import Avatar from '@/components/avatar/Avatar';
import BaseButton from '@/components/base-button/BaseButton';
import DashboardHeader from '@/components/dashboard-header/DashboardHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { UserRole } from '@/enums/user-role.enum';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface TeacherDashboardProps {
  userName?: string;
  profileComplete?: boolean;
}

interface UpcomingSession {
  id: string;
  studentName: string;
  subject: string;
  time: string;
  duration: string;
}

function formatSessionTime(iso: string, timeSlot: string): string {
  const date = new Date(iso);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  const dayLabel = sameDay(date, now)
    ? 'Today'
    : sameDay(date, tomorrow)
      ? 'Tomorrow'
      : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${dayLabel}, ${timeSlot}`;
}

function toUpcomingSession(b: Booking): UpcomingSession {
  return {
    id: b.id,
    studentName: bookingPartyName(b.studentId) || 'Student',
    subject: b.subject,
    time: formatSessionTime(b.date, b.timeSlot),
    duration: `${b.durationMins} min`,
  };
}

function TeacherDashboard({
  userName = 'Teacher',
  profileComplete = true,
}: TeacherDashboardProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const showBanner = !profileComplete && !bannerDismissed;

  const [sessions, setSessions] = useState<UpcomingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    BookingsService.list()
      .then((bookings) => {
        if (!active) return;
        setSessions(
          bookings
            .filter((b) => b.status !== 'cancelled' && b.status !== 'completed')
            .map(toUpcomingSession),
        );
      })
      .catch(() => {
        if (active) setSessions([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    NotificationsService.unreadCount()
      .then((count) => {
        if (active) setUnreadCount(count);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <DashboardHeader
        userName={userName}
        notificationCount={unreadCount}
        onNotificationsPress={() =>
          router.push({
            pathname: '/notifications',
            params: { role: UserRole.TEACHER, name: userName },
          })
        }
        onProfilePress={() =>
          router.push({
            pathname: '/profile',
            params: { role: UserRole.TEACHER, name: userName },
          })
        }
        onCalendarPress={() =>
          router.push({
            pathname: '/schedule',
            params: { role: UserRole.TEACHER, name: userName },
          })
        }
        onLogoutPress={() => router.replace('/login')}
      />

      <FlatList
        data={sessions}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <ActivityIndicator color={palette.tint} />
            ) : (
              <Text style={[styles.emptyText, { color: palette.textMuted }]}>
                No upcoming sessions yet.
              </Text>
            )}
          </View>
        }
        ListHeaderComponent={
          <View>
            {showBanner ? (
              <View
                style={[
                  styles.banner,
                  {
                    backgroundColor: `${palette.tint}14`,
                    borderColor: `${palette.tint}55`,
                  },
                ]}
              >
                <Pressable
                  onPress={() => setBannerDismissed(true)}
                  hitSlop={10}
                  style={styles.bannerClose}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss"
                >
                  <IconSymbol
                    name="xmark"
                    size={16}
                    color={palette.textMuted}
                  />
                </Pressable>
                <View style={styles.bannerHeader}>
                  <View
                    style={[
                      styles.bannerIcon,
                      { backgroundColor: palette.tint },
                    ]}
                  >
                    <IconSymbol
                      name="square.and.pencil"
                      size={18}
                      color="#FFFFFF"
                    />
                  </View>
                  <View style={styles.bannerBody}>
                    <Text
                      style={[styles.bannerTitle, { color: palette.text }]}
                    >
                      Complete your profile
                    </Text>
                    <Text
                      style={[
                        styles.bannerSub,
                        { color: palette.textMuted },
                      ]}
                    >
                      Add your specializations and languages so students can
                      find and book you.
                    </Text>
                  </View>
                </View>
                <BaseButton
                  title="Finish Setup"
                  size="md"
                  onPress={() =>
                    router.push({
                      pathname: '/teacher-onboarding',
                      params: { name: userName },
                    })
                  }
                  containerStyle={styles.bannerBtn}
                />
              </View>
            ) : null}

            <Text style={[styles.sectionTitle, { color: palette.tint }]}>
              Upcoming Sessions
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/join-session',
                params: {
                  sessionId: item.id,
                  counterpartName: item.studentName,
                  subject: item.subject,
                  userId: userName,
                },
              })
            }
            android_ripple={{
              color: `${palette.tint}14`,
              borderless: false,
            }}
            style={({ pressed }) => [
              styles.sessionCard,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
                shadowColor: scheme === 'dark' ? '#000' : '#0F766E',
                opacity: pressed ? 0.9 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Join session with ${item.studentName}`}
          >
            <Avatar name={item.studentName} size="md" />
            <View style={styles.sessionBody}>
              <Text style={[styles.sessionName, { color: palette.text }]}>
                {item.studentName}
              </Text>
              <Text
                style={[styles.sessionSubject, { color: palette.textMuted }]}
              >
                {item.subject} • {item.duration}
              </Text>
              <View style={styles.sessionTimeRow}>
                <IconSymbol
                  name="clock.fill"
                  size={13}
                  color={palette.tint}
                />
                <Text style={[styles.sessionTime, { color: palette.tint }]}>
                  {item.time}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  banner: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    position: 'relative',
  },
  bannerClose: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  bannerHeader: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingRight: Spacing.lg,
    marginBottom: Spacing.md,
  },
  bannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBody: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
  },
  empty: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sessionBody: {
    flex: 1,
  },
  sessionName: {
    fontSize: 15,
    fontWeight: '700',
  },
  sessionSubject: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  sessionTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  sessionTime: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default TeacherDashboard;
