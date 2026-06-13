import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

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

interface Stat {
  id: string;
  label: string;
  value: string;
  icon: 'person.2.fill' | 'star.fill' | 'dollarsign.circle.fill' | 'clock.fill';
  tint: string;
}

interface UpcomingSession {
  id: string;
  studentName: string;
  subject: string;
  time: string;
  duration: string;
}

const STATS: Stat[] = [
  {
    id: 'students',
    label: 'Students',
    value: '24',
    icon: 'person.2.fill',
    tint: '#0FA678',
  },
  {
    id: 'rating',
    label: 'Rating',
    value: '4.9',
    icon: 'star.fill',
    tint: '#F59E0B',
  },
  {
    id: 'earnings',
    label: 'Earnings',
    value: '$1,240',
    icon: 'dollarsign.circle.fill',
    tint: '#10B981',
  },
  {
    id: 'hours',
    label: 'Hours',
    value: '86',
    icon: 'clock.fill',
    tint: '#8B5CF6',
  },
];

const UPCOMING_SESSIONS: UpcomingSession[] = [
  {
    id: '1',
    studentName: 'Ahmed Ali',
    subject: 'Tajweed',
    time: 'Today, 4:00 PM',
    duration: '60 min',
  },
  {
    id: '2',
    studentName: 'Sarah Khan',
    subject: 'Memorization',
    time: 'Today, 6:30 PM',
    duration: '45 min',
  },
  {
    id: '3',
    studentName: 'Yusuf Ibrahim',
    subject: 'Arabic Grammar',
    time: 'Tomorrow, 10:00 AM',
    duration: '60 min',
  },
  {
    id: '4',
    studentName: 'Fatima Noor',
    subject: 'Tafseer',
    time: 'Tomorrow, 2:00 PM',
    duration: '90 min',
  },
];

function TeacherDashboard({
  userName = 'Teacher',
  profileComplete = true,
}: TeacherDashboardProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const showBanner = !profileComplete && !bannerDismissed;

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <DashboardHeader
        userName={userName}
        notificationCount={2}
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
        data={UPCOMING_SESSIONS}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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

            <View style={styles.statsGrid}>
              {STATS.map((stat) => (
                <View
                  key={stat.id}
                  style={[
                    styles.statCard,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                      shadowColor: scheme === 'dark' ? '#000' : '#0F766E',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.statIcon,
                      { backgroundColor: `${stat.tint}22` },
                    ]}
                  >
                    <IconSymbol name={stat.icon} size={20} color={stat.tint} />
                  </View>
                  <Text style={[styles.statValue, { color: palette.text }]}>
                    {stat.value}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: palette.textMuted }]}
                  >
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  statCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: Spacing.md,
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
