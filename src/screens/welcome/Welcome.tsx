import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BaseBottomSheet from '@/components/base-bottom-sheet/BaseBottomSheet';
import BaseButton from '@/components/base-button/BaseButton';
import Logo from '@/components/logo/Logo';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { UserRole } from '@/enums/user-role.enum';
import { useColorScheme } from '@/hooks/use-color-scheme';

type RoleOption = {
  value: UserRole;
  title: string;
  description: string;
  icon: 'graduationcap.fill' | 'person.2.fill';
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: UserRole.STUDENT,
    title: 'Student',
    description: 'Book sessions with certified Quran teachers.',
    icon: 'graduationcap.fill',
  },
  {
    value: UserRole.TEACHER,
    title: 'Teacher',
    description: 'Host sessions and teach students online.',
    icon: 'person.2.fill',
  },
];

function Welcome() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const [roleSheetVisible, setRoleSheetVisible] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setRoleSheetVisible(false);
    router.push({ pathname: '/signup', params: { role } });
  };

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={[styles.safe, { backgroundColor: palette.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Logo size="xl" />
          <Text style={[styles.appName, { color: palette.tint }]}>
            Quran Academy
          </Text>
          <Text style={[styles.tagline, { color: palette.textMuted }]}>
            Learn from Expert Teachers
          </Text>
          <Text style={[styles.description, { color: palette.textMuted }]}>
            Book one-on-one sessions with certified Quran teachers and start
            your learning journey today.
          </Text>
        </View>

        <View style={styles.actions}>
          <BaseButton
            title="Sign In"
            size="lg"
            onPress={() => router.push('/login')}
          />
          <BaseButton
            title="Create Account"
            size="lg"
            variant="outline"
            onPress={() => setRoleSheetVisible(true)}
            containerStyle={styles.secondAction}
          />
        </View>
      </View>

      <BaseBottomSheet
        visible={roleSheetVisible}
        onClose={() => setRoleSheetVisible(false)}
        title="Choose your role"
        subtitle="How would you like to use Quran Academy?"
      >
        <View style={styles.roleList}>
          {ROLE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => handleRoleSelect(opt.value)}
              android_ripple={{ color: `${palette.tint}22`, borderless: false }}
              style={({ pressed }) => [
                styles.roleCard,
                {
                  backgroundColor: palette.surfaceAlt,
                  borderColor: palette.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Sign up as ${opt.title}`}
            >
              <View
                style={[
                  styles.roleIcon,
                  { backgroundColor: `${palette.tint}1A` },
                ]}
              >
                <IconSymbol name={opt.icon} size={26} color={palette.tint} />
              </View>
              <View style={styles.roleBody}>
                <Text style={[styles.roleTitle, { color: palette.text }]}>
                  {opt.title}
                </Text>
                <Text
                  style={[styles.roleDescription, { color: palette.textMuted }]}
                >
                  {opt.description}
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={palette.textMuted}
              />
            </Pressable>
          ))}
        </View>
      </BaseBottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  actions: {
    width: '100%',
    paddingBottom: Spacing.sm,
  },
  secondAction: {
    marginTop: Spacing.md,
  },
  roleList: {
    gap: Spacing.md,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    overflow: 'hidden',
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBody: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  roleDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default Welcome;
