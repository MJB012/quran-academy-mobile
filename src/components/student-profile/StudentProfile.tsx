import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { UsersService, getApiErrorMessage } from '@/api';
import Avatar from '@/components/avatar/Avatar';
import BaseButton from '@/components/base-button/BaseButton';
import BaseChip from '@/components/base-chip/BaseChip';
import ChangePasswordSheet from '@/components/change-password-sheet/ChangePasswordSheet';
import EditProfileSheet from '@/components/edit-profile-sheet/EditProfileSheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { EditProfileFormValues } from '@/entity/user.entity';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface StudentProfileProps {
  userName: string;
  email?: string;
  onLogout?: () => void;
}

function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function StudentProfile({
  userName,
  email = '',
  onLogout,
}: StudentProfileProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  const initial = useMemo(() => splitName(userName), [userName]);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [emailState, setEmailState] = useState(email);

  const [editSheet, setEditSheet] = useState(false);
  const [passwordSheet, setPasswordSheet] = useState(false);

  useEffect(() => {
    setFirstName(initial.firstName);
    setLastName(initial.lastName);
  }, [initial.firstName, initial.lastName]);

  useEffect(() => {
    setEmailState(email);
  }, [email]);

  const fullName = `${firstName} ${lastName}`.trim();

  const handleSaveProfile = async (values: EditProfileFormValues) => {
    try {
      const updated = await UsersService.updateMe({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
      });
      setFirstName(updated.firstName);
      setLastName(updated.lastName);
      setEmailState(updated.email);
      setEditSheet(false);
    } catch (err) {
      Alert.alert('Could not update profile', getApiErrorMessage(err));
    }
  };

  const handleOpenPassword = () => {
    setEditSheet(false);
    setTimeout(() => setPasswordSheet(true), 280);
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: palette.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.hero,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              shadowColor: scheme === 'dark' ? '#000' : '#0F766E',
            },
          ]}
        >
          <Pressable
            onPress={() => setEditSheet(true)}
            hitSlop={8}
            style={({ pressed }) => [
              styles.editBtn,
              {
                backgroundColor: `${palette.tint}14`,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
          >
            <IconSymbol
              name="square.and.pencil"
              size={16}
              color={palette.tint}
            />
          </Pressable>

          <Avatar name={fullName || 'Student'} size="xl" badge="star" />
          <Text style={[styles.name, { color: palette.text }]}>
            {fullName || 'Student'}
          </Text>
          <BaseChip label="Student" variant="tint" size="md" />
          <Text style={[styles.email, { color: palette.textMuted }]}>
            {emailState}
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: palette.surface,
              borderColor: palette.border,
              shadowColor: scheme === 'dark' ? '#000' : '#0F766E',
            },
          ]}
        >
          <Text style={[styles.infoTitle, { color: palette.text }]}>
            Account Info
          </Text>
          <InfoRow label="First Name" value={firstName} palette={palette} />
          <InfoRow label="Last Name" value={lastName} palette={palette} />
          <InfoRow label="Email" value={emailState} palette={palette} />
        </View>

        <BaseButton
          title="Logout"
          size="lg"
          variant="outline"
          onPress={onLogout ?? (() => {})}
          containerStyle={styles.logout}
        />
      </ScrollView>

      <EditProfileSheet
        visible={editSheet}
        onClose={() => setEditSheet(false)}
        initialValues={{ firstName, lastName, email: emailState }}
        onSave={handleSaveProfile}
        onChangePassword={handleOpenPassword}
      />

      <ChangePasswordSheet
        visible={passwordSheet}
        onClose={() => setPasswordSheet(false)}
      />
    </>
  );
}

function InfoRow({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: typeof Colors.light;
}) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: palette.border }]}>
      <Text style={[styles.infoLabel, { color: palette.textMuted }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: palette.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  hero: {
    alignItems: 'center',
    borderRadius: Radii.lg,
    borderWidth: 1,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  editBtn: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  email: {
    fontSize: 13,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.lg,
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
  infoCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
    marginLeft: Spacing.md,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  logout: {
    marginTop: Spacing.xl,
  },
});

export default StudentProfile;
