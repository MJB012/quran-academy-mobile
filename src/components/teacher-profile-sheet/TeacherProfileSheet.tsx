import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Avatar from '@/components/avatar/Avatar';
import BaseBottomSheet from '@/components/base-bottom-sheet/BaseBottomSheet';
import BaseButton from '@/components/base-button/BaseButton';
import BaseChip from '@/components/base-chip/BaseChip';
import { Teacher } from '@/components/teacher-card/TeacherCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface TeacherProfileSheetProps {
  teacher: Teacher | null;
  visible: boolean;
  onClose: () => void;
  onBook?: (teacher: Teacher) => void;
}

function TeacherProfileSheet({
  teacher,
  visible,
  onClose,
  onBook,
}: TeacherProfileSheetProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  return (
    <BaseBottomSheet visible={visible && !!teacher} onClose={onClose}>
      {teacher ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.hero}>
            <Avatar name={teacher.name} size="xl" badge="star" />
            <Text style={[styles.name, { color: palette.text }]}>
              {teacher.name}
            </Text>
            <Text
              style={[styles.qualification, { color: palette.textMuted }]}
              numberOfLines={2}
            >
              {teacher.qualification}
            </Text>

            <View style={styles.meta}>
              <View style={styles.ratingPill}>
                <IconSymbol name="star.fill" size={14} color="#D97706" />
                <Text style={styles.ratingText}>
                  {teacher.rating.toFixed(1)}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <IconSymbol
                  name="person.2.fill"
                  size={16}
                  color={palette.textMuted}
                />
                <Text style={[styles.metaText, { color: palette.textMuted }]}>
                  {teacher.studentsCount} students
                </Text>
              </View>
            </View>
          </View>

          <Section label="About" palette={palette}>
            <Text style={[styles.body, { color: palette.text }]}>
              {teacher.name.split(' ')[0]} is an experienced Quran teacher with
              deep expertise in {teacher.specializations.slice(0, 2).join(' and ')}.
              Classes are patient, structured, and tailored to each student&apos;s
              pace — from foundational pronunciation to advanced memorization
              techniques.
            </Text>
          </Section>

          <Section label="Specializations" palette={palette}>
            <View style={styles.chips}>
              {teacher.specializations.map((s) => (
                <BaseChip key={s} label={s} variant="tint" size="md" />
              ))}
            </View>
          </Section>

          <Section label="Languages" palette={palette}>
            <View style={styles.chips}>
              {teacher.languages.map((l) => (
                <BaseChip key={l} label={l} variant="neutral" size="md" />
              ))}
            </View>
          </Section>

          <View
            style={[
              styles.priceCard,
              {
                backgroundColor: `${palette.tint}0F`,
                borderColor: `${palette.tint}55`,
              },
            ]}
          >
            <View>
              <Text style={[styles.priceValue, { color: palette.tint }]}>
                ${teacher.pricePerHour}
              </Text>
              <Text style={[styles.priceLabel, { color: palette.textMuted }]}>
                per hour • 60 min session
              </Text>
            </View>
            <IconSymbol
              name="dollarsign.circle.fill"
              size={34}
              color={palette.tint}
            />
          </View>

          <BaseButton
            title="Book Session"
            size="lg"
            onPress={() => {
              onBook?.(teacher);
              onClose();
            }}
            containerStyle={styles.bookBtn}
          />

          <BaseButton
            title="Close"
            variant="ghost"
            size="md"
            onPress={onClose}
            containerStyle={styles.closeBtn}
          />
        </ScrollView>
      ) : null}
    </BaseBottomSheet>
  );
}

function Section({
  label,
  children,
  palette,
}: {
  label: string;
  children: React.ReactNode;
  palette: typeof Colors.light;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: palette.textMuted }]}>
        {label}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.sm,
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  qualification: {
    fontSize: 13,
    textAlign: 'center',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  ratingText: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  priceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  priceLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  bookBtn: {
    marginTop: Spacing.xs,
  },
  closeBtn: {
    marginTop: Spacing.xs,
  },
});

export default TeacherProfileSheet;
