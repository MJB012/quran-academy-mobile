import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  name?: string;
  source?: ImageSourcePropType;
  size?: AvatarSize;
  badge?: 'star' | 'none';
  backgroundColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const AVATAR_COLORS = [
  '#0FA678',
  '#F59E0B',
  '#8B5CF6',
  '#EF4444',
  '#3B82F6',
  '#EC4899',
  '#14B8A6',
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initialsFor(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function sizeFor(size: AvatarSize) {
  switch (size) {
    case 'sm':
      return { box: 36, text: 14, badge: 14, badgeIcon: 8 };
    case 'md':
      return { box: 48, text: 16, badge: 18, badgeIcon: 10 };
    case 'lg':
    default:
      return { box: 64, text: 20, badge: 22, badgeIcon: 12 };
    case 'xl':
      return { box: 88, text: 28, badge: 26, badgeIcon: 14 };
  }
}

function Avatar({
  name,
  source,
  size = 'lg',
  badge = 'none',
  backgroundColor,
  containerStyle,
}: AvatarProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const { box, text, badge: badgeSize, badgeIcon } = sizeFor(size);

  const initials = initialsFor(name);
  const derivedBg =
    backgroundColor ??
    (name ? AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length] : palette.tint);

  return (
    <View style={[{ width: box, height: box }, containerStyle]}>
      <View
        style={[
          styles.circle,
          {
            width: box,
            height: box,
            borderRadius: box / 2,
            backgroundColor: derivedBg,
          },
        ]}
      >
        {source ? (
          <Image
            source={source}
            style={{ width: box, height: box, borderRadius: box / 2 }}
            resizeMode="cover"
          />
        ) : (
          <Text
            style={[
              styles.initials,
              { fontSize: text, color: '#FFFFFF' },
            ]}
          >
            {initials}
          </Text>
        )}
      </View>
      {badge === 'star' ? (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: '#F59E0B',
              borderColor: palette.surface,
            },
          ]}
        >
          <IconSymbol name="star.fill" size={badgeIcon} color="#FFFFFF" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Avatar;
