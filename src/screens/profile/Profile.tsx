import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

import { AuthService, TokenStore, UsersService } from '@/api';
import type { StoredUser } from '@/api/token-store';
import ScreenHeader from '@/components/screen-header/ScreenHeader';
import StudentProfile from '@/components/student-profile/StudentProfile';
import TeacherProfile from '@/components/teacher-profile/TeacherProfile';
import { Colors } from '@/constants/theme';
import { UserRole, parseUserRole } from '@/enums/user-role.enum';
import { useColorScheme } from '@/hooks/use-color-scheme';

function Profile() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string; name?: string }>();

  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    let active = true;
    // Show the cached user immediately, then refresh from the backend.
    TokenStore.getUser().then((u) => {
      if (active && u) setUser(u);
    });
    UsersService.me()
      .then((u) => {
        if (active) setUser(u);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const role = useMemo(
    () => parseUserRole(user?.role ?? params.role),
    [user?.role, params.role],
  );
  const isTeacher = role === UserRole.TEACHER;
  const userName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : (params.name ?? '');
  const email = user?.email ?? '';

  const onLogout = async () => {
    await AuthService.logout();
    router.replace('/login');
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={palette.tint} />
      <ScreenHeader title="Profile" />
      {isTeacher ? (
        <TeacherProfile
          userName={userName}
          email={email}
          onLogout={onLogout}
        />
      ) : (
        <StudentProfile
          userName={userName}
          email={email}
          onLogout={onLogout}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default Profile;
