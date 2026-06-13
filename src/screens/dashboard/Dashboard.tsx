import { useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import { StatusBar } from 'react-native';

import StudentDashboard from '@/components/student-dashboard/StudentDashboard';
import TeacherDashboard from '@/components/teacher-dashboard/TeacherDashboard';
import { Colors } from '@/constants/theme';
import { UserRole, parseUserRole } from '@/enums/user-role.enum';
import { useColorScheme } from '@/hooks/use-color-scheme';

function Dashboard() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const params = useLocalSearchParams<{
    role?: string;
    name?: string;
    profileComplete?: string;
  }>();

  const role = useMemo(() => parseUserRole(params.role), [params.role]);
  const userName =
    params.name ?? (role === UserRole.TEACHER ? 'Teacher' : 'Ahmed Ali');
  const profileComplete = params.profileComplete !== 'false';

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={palette.tint} />
      {role === UserRole.TEACHER ? (
        <TeacherDashboard
          userName={userName}
          profileComplete={profileComplete}
        />
      ) : (
        <StudentDashboard userName={userName} />
      )}
    </>
  );
}

export default Dashboard;
