import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type HeaderIcon =
  | 'chevron.left'
  | 'xmark'
  | 'bell.fill'
  | 'gear'
  | 'trash.fill'
  | 'checkmark'
  | 'checkmark.circle.fill'
  | 'square.and.pencil';

export interface HeaderAction {
  icon?: HeaderIcon;
  label?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  destructive?: boolean;
}

export interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  leftIcon?: HeaderIcon;
  rightActions?: HeaderAction[];
}

function ScreenHeader({
  title,
  onBack,
  leftIcon = 'chevron.left',
  rightActions,
}: ScreenHeaderProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  const resolvedActions = rightActions ?? [];

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: palette.tint,
          paddingTop: insets.top + Spacing.sm,
        },
      ]}
    >
      <Pressable
        onPress={handleBack}
        hitSlop={10}
        style={({ pressed }) => [styles.sideLeft, { opacity: pressed ? 0.6 : 1 }]}
        accessibilityRole="button"
        accessibilityLabel={leftIcon === 'xmark' ? 'Cancel' : 'Back'}
      >
        <IconSymbol name={leftIcon} size={24} color="#FFFFFF" />
      </Pressable>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.actions}>
        {resolvedActions.length > 0 ? (
          resolvedActions.map((action, i) => (
            <Pressable
              key={`${action.label ?? ''}-${action.icon ?? ''}-${i}`}
              onPress={action.onPress}
              hitSlop={10}
              style={({ pressed }) => [
                styles.actionBtn,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={action.accessibilityLabel ?? action.label}
            >
              {action.label ? (
                <Text
                  style={[
                    styles.actionLabel,
                    action.destructive ? styles.actionDestructive : null,
                  ]}
                >
                  {action.label}
                </Text>
              ) : action.icon ? (
                <IconSymbol
                  name={action.icon}
                  size={22}
                  color={action.destructive ? '#FEE2E2' : '#FFFFFF'}
                />
              ) : null}
            </Pressable>
          ))
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  sideLeft: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 44,
  },
  actionBtn: {
    paddingHorizontal: 8,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionDestructive: {
    color: '#FEE2E2',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
});

export default ScreenHeader;
