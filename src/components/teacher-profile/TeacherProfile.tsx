import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { TeachersService, UsersService, getApiErrorMessage } from '@/api';
import Avatar from '@/components/avatar/Avatar';
import BaseButton from '@/components/base-button/BaseButton';
import BaseChip from '@/components/base-chip/BaseChip';
import ChangePasswordSheet from '@/components/change-password-sheet/ChangePasswordSheet';
import EditChipsSheet from '@/components/edit-chips-sheet/EditChipsSheet';
import EditProfileSheet from '@/components/edit-profile-sheet/EditProfileSheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { EditProfileFormValues } from '@/entity/user.entity';
import {
  LANGUAGE_OPTIONS,
  SPECIALIZATION_OPTIONS,
} from '@/entity/teacher-onboarding.entity';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface TeacherProfileProps {
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

function TeacherProfile({
  userName,
  email = '',
  onLogout,
}: TeacherProfileProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  const initial = useMemo(() => splitName(userName), [userName]);
  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [emailState, setEmailState] = useState(email);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [qualification, setQualification] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | null>(null);
  const [bio, setBio] = useState('');

  const [editSheet, setEditSheet] = useState(false);
  const [passwordSheet, setPasswordSheet] = useState(false);
  const [specSheet, setSpecSheet] = useState(false);
  const [langSheet, setLangSheet] = useState(false);
  const [savingExpertise, setSavingExpertise] = useState(false);

  useEffect(() => {
    setFirstName(initial.firstName);
    setLastName(initial.lastName);
  }, [initial.firstName, initial.lastName]);

  useEffect(() => {
    setEmailState(email);
  }, [email]);

  // Load the teacher's saved profile (specializations, languages, etc.) from the API.
  useEffect(() => {
    let active = true;
    TeachersService.myProfile()
      .then((profile) => {
        if (!active || !profile) return;
        setSpecializations(profile.specializations ?? []);
        setLanguages(profile.languages ?? []);
        setQualification(profile.qualification ?? '');
        setHourlyRate(
          typeof profile.hourlyRate === 'number' ? profile.hourlyRate : null,
        );
        setBio(profile.bio ?? '');
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const fullName = `${firstName} ${lastName}`.trim();

  // Persist specialization/language edits. The backend upsert requires a full
  // profile, so we resend qualification + hourlyRate (loaded from /teachers/me).
  const persistExpertise = async (next: {
    specializations?: string[];
    languages?: string[];
  }) => {
    if (savingExpertise) return;
    const nextSpecs = next.specializations ?? specializations;
    const nextLangs = next.languages ?? languages;
    if (!qualification || hourlyRate == null) {
      Alert.alert(
        'Finish your profile first',
        'Please complete your profile setup (qualification and hourly rate) before editing specializations or languages.',
      );
      return;
    }
    setSavingExpertise(true);
    try {
      await TeachersService.onboarding({
        specializations: nextSpecs,
        languages: nextLangs,
        qualification,
        hourlyRate,
        bio: bio || undefined,
      });
      setSpecializations(nextSpecs);
      setLanguages(nextLangs);
      setSpecSheet(false);
      setLangSheet(false);
    } catch (err) {
      Alert.alert('Could not save', getApiErrorMessage(err));
    } finally {
      setSavingExpertise(false);
    }
  };

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
          <SectionEditButton
            palette={palette}
            onPress={() => setEditSheet(true)}
            label="Edit profile"
          />

          <Avatar name={fullName || 'Teacher'} size="xl" badge="star" />
          <Text style={[styles.name, { color: palette.text }]}>
            {fullName || 'Teacher'}
          </Text>
          {qualification ? (
            <Text style={[styles.qualification, { color: palette.textMuted }]}>
              {qualification}
            </Text>
          ) : null}
          <BaseChip label="Teacher" variant="tint" size="md" />
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
          <View style={styles.sectionHeader}>
            <Text style={[styles.infoTitle, { color: palette.text }]}>
              Account Info
            </Text>
            <SectionEditButton
              palette={palette}
              onPress={() => setEditSheet(true)}
              label="Edit account info"
              inline
            />
          </View>
          <InfoRow label="First Name" value={firstName} palette={palette} />
          <InfoRow label="Last Name" value={lastName} palette={palette} />
          <InfoRow label="Email" value={emailState} palette={palette} />
          {hourlyRate != null ? (
            <InfoRow
              label="Hourly Rate"
              value={`$${hourlyRate}`}
              palette={palette}
            />
          ) : null}
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
          <View style={styles.sectionHeader}>
            <Text style={[styles.infoTitle, { color: palette.text }]}>
              Specializations
            </Text>
            <SectionEditButton
              palette={palette}
              onPress={() => setSpecSheet(true)}
              label="Edit specializations"
              inline
            />
          </View>
          {specializations.length > 0 ? (
            <View style={styles.chips}>
              {specializations.map((s) => (
                <BaseChip key={s} label={s} variant="tint" size="md" />
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyHint, { color: palette.textMuted }]}>
              No specializations added yet — tap edit to add some.
            </Text>
          )}
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
          <View style={styles.sectionHeader}>
            <Text style={[styles.infoTitle, { color: palette.text }]}>
              Languages
            </Text>
            <SectionEditButton
              palette={palette}
              onPress={() => setLangSheet(true)}
              label="Edit languages"
              inline
            />
          </View>
          {languages.length > 0 ? (
            <View style={styles.chips}>
              {languages.map((l) => (
                <BaseChip key={l} label={l} variant="neutral" size="md" />
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyHint, { color: palette.textMuted }]}>
              No languages added yet — tap edit to add some.
            </Text>
          )}
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

      <EditChipsSheet
        visible={specSheet}
        onClose={() => setSpecSheet(false)}
        title="Edit Specializations"
        subtitle="Update the subjects you teach"
        label="Specializations"
        helperText="Select all that apply (at least one)."
        options={SPECIALIZATION_OPTIONS}
        initialValues={specializations}
        emptyError="Pick at least one specialization"
        onSave={(v) => persistExpertise({ specializations: v })}
      />

      <EditChipsSheet
        visible={langSheet}
        onClose={() => setLangSheet(false)}
        title="Edit Languages"
        subtitle="Update the languages you can teach in"
        label="Languages"
        helperText="Select all that apply (at least one)."
        options={LANGUAGE_OPTIONS}
        initialValues={languages}
        emptyError="Pick at least one language"
        onSave={(v) => persistExpertise({ languages: v })}
      />
    </>
  );
}

function SectionEditButton({
  palette,
  onPress,
  label,
  inline = false,
}: {
  palette: typeof Colors.light;
  onPress: () => void;
  label: string;
  inline?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        inline ? styles.editBtnInline : styles.editBtnAbsolute,
        {
          backgroundColor: `${palette.tint}14`,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <IconSymbol name="square.and.pencil" size={16} color={palette.tint} />
    </Pressable>
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
  editBtnAbsolute: {
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
  editBtnInline: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  qualification: {
    fontSize: 13,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '800',
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
  emptyHint: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  logout: {
    marginTop: Spacing.xl,
  },
});

export default TeacherProfile;
