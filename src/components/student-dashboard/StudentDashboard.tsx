import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { NotificationsService, TeachersService } from '@/api';
import BaseInput from '@/components/base-input/BaseInput';
import DashboardHeader from '@/components/dashboard-header/DashboardHeader';
import TeacherCard, { Teacher } from '@/components/teacher-card/TeacherCard';
import TeacherProfileSheet from '@/components/teacher-profile-sheet/TeacherProfileSheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { UserRole } from '@/enums/user-role.enum';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTeachersRealtime } from '@/hooks/use-teachers-realtime';

export interface StudentDashboardProps {
  userName?: string;
}

function StudentDashboard({ userName = 'Student' }: StudentDashboardProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadTeachers = useCallback(async () => {
    try {
      const res = await TeachersService.list();
      setAllTeachers(res.items);
    } catch {
      setAllTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadTeachers();
    NotificationsService.unreadCount()
      .then((count) => {
        if (active) setUnreadCount(count);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [loadTeachers]);

  // Live updates: refetch whenever a verified teacher's availability changes.
  useTeachersRealtime(loadTeachers);

  const teachers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTeachers;
    return allTeachers.filter((t) => {
      const haystack = [
        t.name,
        t.qualification,
        ...t.specializations,
        ...t.languages,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [allTeachers, query]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <DashboardHeader
        userName={userName}
        notificationCount={unreadCount}
        onNotificationsPress={() =>
          router.push({
            pathname: '/notifications',
            params: { role: UserRole.STUDENT, name: userName },
          })
        }
        onProfilePress={() =>
          router.push({
            pathname: '/profile',
            params: { role: UserRole.STUDENT, name: userName },
          })
        }
        onCalendarPress={() =>
          router.push({
            pathname: '/schedule',
            params: { role: UserRole.STUDENT, name: userName },
          })
        }
        onLogoutPress={() => router.replace('/login')}
      />

      <FlatList
        data={teachers}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <View style={styles.searchWrap}>
              <BaseInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search teachers by name, specialization..."
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                leftIcon={
                  <IconSymbol
                    name="magnifyingglass"
                    size={18}
                    color={palette.textMuted}
                  />
                }
                containerStyle={styles.searchInput}
              />
            </View>
            <Text style={[styles.sectionTitle, { color: palette.tint }]}>
              Available Teachers
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <ActivityIndicator color={palette.tint} />
            ) : (
              <Text style={[styles.emptyText, { color: palette.textMuted }]}>
                {query
                  ? `No teachers match "${query}".`
                  : 'No teachers available yet.'}
              </Text>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TeacherCard
            teacher={item}
            onViewProfile={(t) => setSelectedTeacher(t)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      <TeacherProfileSheet
        teacher={selectedTeacher}
        visible={!!selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        onBook={(t) => {
          setSelectedTeacher(null);
          setTimeout(() => {
            router.push({
              pathname: '/book-session',
              params: {
                teacherId: t.id,
                teacherName: t.name,
                teacherQualification: t.qualification,
                teacherPrice: String(t.pricePerHour),
                teacherSpecializations: t.specializations.join(','),
              },
            });
          }, 280);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  searchWrap: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  empty: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default StudentDashboard;
