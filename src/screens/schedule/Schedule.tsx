import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  BookingsService,
  bookingPartyName,
  type Booking,
} from '@/api';
import Avatar from '@/components/avatar/Avatar';
import BaseButton from '@/components/base-button/BaseButton';
import BaseChip from '@/components/base-chip/BaseChip';
import ScreenHeader from '@/components/screen-header/ScreenHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { UserRole, parseUserRole } from '@/enums/user-role.enum';
import { useColorScheme } from '@/hooks/use-color-scheme';

type SessionCategory = 'upcoming' | 'completed' | 'pending_payment';

interface Session {
  id: string;
  counterpartName: string;
  subject: string;
  day: string;
  dayNumber: string;
  month: string;
  time: string;
  duration: string;
  category: SessionCategory;
  isToday?: boolean;
  amount?: number;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDayLabel(date: Date): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameDay(date, now)) return 'Today';
  if (sameDay(date, tomorrow)) return 'Tomorrow';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function mapBookingToSession(b: Booking, role: UserRole): Session | null {
  if (b.status === 'cancelled') return null;
  const category: SessionCategory =
    b.status === 'completed'
      ? 'completed'
      : b.status === 'pending'
        ? 'pending_payment'
        : 'upcoming';
  const date = new Date(b.date);
  const counterpartName =
    role === UserRole.STUDENT
      ? bookingPartyName(b.teacherId)
      : bookingPartyName(b.studentId);
  return {
    id: b.id,
    counterpartName: counterpartName || 'Unknown',
    subject: b.subject,
    day: formatDayLabel(date),
    dayNumber: String(date.getDate()),
    month: MONTHS[date.getMonth()],
    time: b.timeSlot,
    duration: `${b.durationMins} min`,
    category,
    isToday: sameDay(date, new Date()),
    amount: category === 'pending_payment' ? b.totalAmount : undefined,
  };
}

const _STUDENT_SESSIONS_UNUSED: Session[] = [
  {
    id: 'ss1',
    counterpartName: 'Sheikh Muhammad Ibrahim',
    subject: 'Tajweed',
    day: 'Today',
    dayNumber: '24',
    month: 'APR',
    time: '4:00 PM',
    duration: '60 min',
    category: 'upcoming',
    isToday: true,
  },
  {
    id: 'ss2',
    counterpartName: 'Ustadha Fatima Ahmed',
    subject: 'Memorization',
    day: 'Tomorrow',
    dayNumber: '25',
    month: 'APR',
    time: '10:00 AM',
    duration: '45 min',
    category: 'upcoming',
  },
  {
    id: 'ss3',
    counterpartName: 'Ustadh Yusuf Ali',
    subject: 'Arabic Grammar',
    day: 'Sat, Apr 26',
    dayNumber: '26',
    month: 'APR',
    time: '11:30 AM',
    duration: '60 min',
    category: 'upcoming',
  },
  {
    id: 'ss4',
    counterpartName: 'Sheikh Muhammad Ibrahim',
    subject: 'Tajweed',
    day: 'Tue, Apr 22',
    dayNumber: '22',
    month: 'APR',
    time: '4:00 PM',
    duration: '60 min',
    category: 'completed',
  },
  {
    id: 'ss5',
    counterpartName: 'Ustadha Fatima Ahmed',
    subject: 'Memorization',
    day: 'Sun, Apr 20',
    dayNumber: '20',
    month: 'APR',
    time: '10:00 AM',
    duration: '45 min',
    category: 'completed',
  },
  {
    id: 'ss6',
    counterpartName: 'Sheikh Abdullah Rahman',
    subject: 'Islamic Studies',
    day: 'Mon, Apr 28',
    dayNumber: '28',
    month: 'APR',
    time: '3:00 PM',
    duration: '60 min',
    category: 'pending_payment',
    amount: 18,
  },
  {
    id: 'ss7',
    counterpartName: 'Ustadh Yusuf Ali',
    subject: 'Quranic Arabic',
    day: 'Wed, Apr 30',
    dayNumber: '30',
    month: 'APR',
    time: '11:00 AM',
    duration: '90 min',
    category: 'pending_payment',
    amount: 33,
  },
];

const _TEACHER_SESSIONS_UNUSED: Session[] = [
  {
    id: 'ts1',
    counterpartName: 'Ahmed Ali',
    subject: 'Tajweed',
    day: 'Today',
    dayNumber: '24',
    month: 'APR',
    time: '4:00 PM',
    duration: '60 min',
    category: 'upcoming',
    isToday: true,
  },
  {
    id: 'ts2',
    counterpartName: 'Sarah Khan',
    subject: 'Memorization',
    day: 'Today',
    dayNumber: '24',
    month: 'APR',
    time: '6:30 PM',
    duration: '45 min',
    category: 'upcoming',
    isToday: true,
  },
  {
    id: 'ts3',
    counterpartName: 'Yusuf Ibrahim',
    subject: 'Arabic Grammar',
    day: 'Tomorrow',
    dayNumber: '25',
    month: 'APR',
    time: '10:00 AM',
    duration: '60 min',
    category: 'upcoming',
  },
  {
    id: 'ts4',
    counterpartName: 'Ahmed Ali',
    subject: 'Tajweed',
    day: 'Tue, Apr 22',
    dayNumber: '22',
    month: 'APR',
    time: '4:00 PM',
    duration: '60 min',
    category: 'completed',
  },
  {
    id: 'ts5',
    counterpartName: 'Fatima Noor',
    subject: 'Tafseer',
    day: 'Sun, Apr 20',
    dayNumber: '20',
    month: 'APR',
    time: '2:00 PM',
    duration: '90 min',
    category: 'completed',
  },
  {
    id: 'ts6',
    counterpartName: 'Sarah Khan',
    subject: 'Memorization',
    day: 'Mon, Apr 28',
    dayNumber: '28',
    month: 'APR',
    time: '6:30 PM',
    duration: '45 min',
    category: 'pending_payment',
    amount: 19,
  },
];

const FILTERS: { key: SessionCategory; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending_payment', label: 'Pending' },
];

function Schedule() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string; name?: string }>();

  const role = useMemo(() => parseUserRole(params.role), [params.role]);
  const userName = params.name ?? '';
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const counterpartLabel = role === UserRole.TEACHER ? 'Student' : 'Teacher';

  useEffect(() => {
    let active = true;
    setLoading(true);
    BookingsService.list()
      .then((bookings) => {
        if (!active) return;
        setAllSessions(
          bookings
            .map((b) => mapBookingToSession(b, role))
            .filter((s): s is Session => s !== null),
        );
      })
      .catch(() => {
        if (active) setAllSessions([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [role]);

  const joinSession = (session: Session) => {
    router.push({
      pathname: '/join-session',
      params: {
        sessionId: session.id,
        counterpartName: session.counterpartName,
        subject: session.subject,
        userId: userName || `${role}-${session.id}`,
      },
    });
  };

  const [filter, setFilter] = useState<SessionCategory>('upcoming');

  const counts = useMemo(() => {
    return {
      upcoming: allSessions.filter((s) => s.category === 'upcoming').length,
      completed: allSessions.filter((s) => s.category === 'completed').length,
      pending_payment: allSessions.filter(
        (s) => s.category === 'pending_payment',
      ).length,
    };
  }, [allSessions]);

  const filtered = useMemo(
    () => allSessions.filter((s) => s.category === filter),
    [allSessions, filter],
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={palette.tint} />
      <ScreenHeader title="My Schedule" />

      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count = counts[f.key];
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              android_ripple={{ color: `${palette.tint}14`, borderless: false }}
              style={[
                styles.filterTab,
                {
                  backgroundColor: active ? palette.tint : palette.surface,
                  borderColor: active ? palette.tint : palette.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.filterLabel,
                  { color: active ? '#FFFFFF' : palette.text },
                ]}
                numberOfLines={1}
              >
                {f.label}
              </Text>
              <View
                style={[
                  styles.filterCount,
                  {
                    backgroundColor: active
                      ? 'rgba(255,255,255,0.25)'
                      : `${palette.tint}22`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    { color: active ? '#FFFFFF' : palette.tint },
                  ]}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={palette.tint} />
            </View>
          ) : (
          <View style={styles.empty}>
            <View
              style={[styles.emptyIcon, { backgroundColor: `${palette.tint}14` }]}
            >
              <IconSymbol
                name="calendar.badge.clock"
                size={26}
                color={palette.tint}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: palette.text }]}>
              {filter === 'upcoming'
                ? 'No upcoming sessions'
                : filter === 'completed'
                  ? 'No completed sessions yet'
                  : 'Nothing pending payment'}
            </Text>
            <Text style={[styles.emptyMessage, { color: palette.textMuted }]}>
              {filter === 'upcoming'
                ? 'Book a session to see it here.'
                : filter === 'completed'
                  ? 'Your past sessions will show up here.'
                  : 'Sessions awaiting payment will appear here.'}
            </Text>
          </View>
          )
        }
        renderItem={({ item }) => (
          <SessionRow
            session={item}
            counterpartLabel={counterpartLabel}
            palette={palette}
            scheme={scheme}
            onJoin={() => joinSession(item)}
          />
        )}
      />
    </View>
  );
}

function SessionRow({
  session,
  counterpartLabel,
  palette,
  scheme,
  onJoin,
}: {
  session: Session;
  counterpartLabel: string;
  palette: typeof Colors.light;
  scheme: 'light' | 'dark';
  onJoin: () => void;
}) {
  const isCompleted = session.category === 'completed';
  const isPending = session.category === 'pending_payment';

  const dateBg = session.isToday
    ? palette.tint
    : isCompleted
      ? `${palette.textMuted}14`
      : isPending
        ? '#F59E0B22'
        : `${palette.tint}14`;
  const dateFg = session.isToday
    ? '#FFFFFF'
    : isCompleted
      ? palette.textMuted
      : isPending
        ? '#B45309'
        : palette.tint;

  return (
    <View
      style={[
        styles.sessionCard,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          shadowColor: scheme === 'dark' ? '#000' : '#0F766E',
          opacity: isCompleted ? 0.9 : 1,
        },
      ]}
    >
      <View style={[styles.dateBlock, { backgroundColor: dateBg }]}>
        <Text style={[styles.dateNumber, { color: dateFg }]}>
          {session.dayNumber}
        </Text>
        <Text
          style={[
            styles.dateMonth,
            {
              color: session.isToday
                ? 'rgba(255,255,255,0.85)'
                : dateFg,
            },
          ]}
        >
          {session.month}
        </Text>
      </View>

      <View style={styles.sessionBody}>
        <View style={styles.sessionHeader}>
          <Avatar name={session.counterpartName} size="sm" />
          <View style={styles.sessionNames}>
            <Text
              style={[styles.counterpartLabel, { color: palette.textMuted }]}
            >
              {counterpartLabel}
            </Text>
            <Text
              style={[styles.counterpart, { color: palette.text }]}
              numberOfLines={1}
            >
              {session.counterpartName}
            </Text>
          </View>
          {isCompleted ? (
            <BaseChip label="Completed" variant="neutral" />
          ) : isPending ? (
            <BaseChip label="Unpaid" variant="warning" />
          ) : null}
        </View>

        <Text
          style={[styles.subject, { color: palette.text }]}
          numberOfLines={1}
        >
          {session.subject}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <IconSymbol
              name="clock.fill"
              size={13}
              color={isCompleted ? palette.textMuted : palette.tint}
            />
            <Text
              style={[
                styles.metaText,
                { color: isCompleted ? palette.textMuted : palette.tint },
              ]}
            >
              {session.day}, {session.time}
            </Text>
          </View>
          <Text style={[styles.metaDuration, { color: palette.textMuted }]}>
            {session.duration}
          </Text>
        </View>

        {isPending ? (
          <View style={styles.payRow}>
            <Text style={[styles.payAmount, { color: palette.text }]}>
              ${session.amount}
              <Text style={[styles.payNote, { color: palette.textMuted }]}>
                {' '}
                due
              </Text>
            </Text>
            <BaseButton
              title="Pay Now"
              size="sm"
              fullWidth={false}
              onPress={() => {}}
            />
          </View>
        ) : (
          <BaseButton
            title={
              session.isToday
                ? 'Join Session'
                : isCompleted
                  ? 'View Summary'
                  : 'View Details'
            }
            size="sm"
            variant={session.isToday ? 'primary' : 'outline'}
            onPress={session.isToday ? onJoin : () => {}}
            containerStyle={styles.joinBtn}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radii.pill,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    overflow: 'hidden',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterCount: {
    minWidth: 22,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  sessionCard: {
    flexDirection: 'row',
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  dateBlock: {
    width: 58,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  sessionBody: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sessionNames: {
    flex: 1,
  },
  counterpartLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  counterpart: {
    fontSize: 14,
    fontWeight: '700',
  },
  subject: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  metaDuration: {
    fontSize: 12,
    fontWeight: '600',
  },
  joinBtn: {
    marginTop: Spacing.sm,
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  payAmount: {
    fontSize: 17,
    fontWeight: '800',
  },
  payNote: {
    fontSize: 12,
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyMessage: {
    fontSize: 13,
    textAlign: 'center',
  },
});

export default Schedule;
