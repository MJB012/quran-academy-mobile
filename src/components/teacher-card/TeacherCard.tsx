import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Avatar from '@/components/avatar/Avatar';
import BaseButton from '@/components/base-button/BaseButton';
import BaseChip from '@/components/base-chip/BaseChip';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export interface Teacher {
  id: string;
  name: string;
  qualification: string;
  rating: number;
  studentsCount: number;
  specializations: string[];
  languages: string[];
  pricePerHour: number;
}

export interface TeacherCardProps {
  teacher: Teacher;
  onViewProfile?: (teacher: Teacher) => void;
}

function TeacherCard({ teacher, onViewProfile }: TeacherCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: palette.surface,
          borderColor: palette.border,
          shadowColor: scheme === 'dark' ? '#000' : '#0F766E',
        },
      ]}
    >
      <View style={styles.row}>
        <Avatar name={teacher.name} size="lg" badge="star" />
        <View style={styles.identity}>
          <Text
            style={[styles.name, { color: palette.text }]}
            numberOfLines={1}
          >
            {teacher.name}
          </Text>
          <Text
            style={[styles.qualification, { color: palette.textMuted }]}
            numberOfLines={1}
          >
            {teacher.qualification}
          </Text>
          <View style={styles.meta}>
            <View style={styles.ratingPill}>
              <IconSymbol name="star.fill" size={12} color="#D97706" />
              <Text style={styles.ratingText}>
                {teacher.rating.toFixed(1)}
              </Text>
            </View>
            <View style={styles.countRow}>
              <IconSymbol
                name="person.2.fill"
                size={14}
                color={palette.textMuted}
              />
              <Text style={[styles.countText, { color: palette.textMuted }]}>
                {teacher.studentsCount}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: palette.text }]}>
          Specializations:
        </Text>
        <View style={styles.chips}>
          {teacher.specializations.map((s) => (
            <BaseChip key={s} label={s} variant="tint" />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: palette.text }]}>
          Languages:
        </Text>
        <Text style={[styles.languages, { color: palette.textMuted }]}>
          {teacher.languages.join(', ')}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: palette.border }]} />

      <View style={styles.footer}>
        <View>
          <Text style={[styles.price, { color: palette.tint }]}>
            ${teacher.pricePerHour}
          </Text>
          <Text style={[styles.priceNote, { color: palette.textMuted }]}>
            per hour
          </Text>
        </View>
        <BaseButton
          title="View Profile"
          size="md"
          fullWidth={false}
          onPress={() => onViewProfile?.(teacher)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  identity: {
    flex: 1,
    paddingTop: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  qualification: {
    fontSize: 13,
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs + 2,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.pill,
  },
  ratingText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '700',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginTop: Spacing.md,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languages: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
  },
  priceNote: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default TeacherCard;
