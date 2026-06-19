import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'react-native';

import { TokenStore } from '@/api';
import type { StoredUser } from '@/api/token-store';
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

  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    let active = true;
    TokenStore.getUser().then((u) => {
      if (active && u) setUser(u);
    });
    return () => {
      active = false;
    };
  }, []);

  const role = useMemo(
    () => parseUserRole(user?.role ?? params.role),
    [user?.role, params.role],
  );
  const userName = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : (params.name ?? undefined);
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
