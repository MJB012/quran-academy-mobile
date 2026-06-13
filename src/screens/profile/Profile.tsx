import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';

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

  const role = useMemo(() => parseUserRole(params.role), [params.role]);
  const isTeacher = role === UserRole.TEACHER;
  const userName =
    params.name ?? (isTeacher ? 'Sheikh Muhammad Ibrahim' : 'Ahmed Ali');
  const email = isTeacher ? 'teacher@gmail.com' : 'student@gmail.com';

  const onLogout = () => router.replace('/login');

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
