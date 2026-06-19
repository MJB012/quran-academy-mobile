import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { NotificationsService, type ApiNotification } from '@/api/services/notifications.service';
import ReanimatedSwipeable, {
  SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import ScreenHeader, {
  HeaderAction,
} from '@/components/screen-header/ScreenHeader';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { parseUserRole } from '@/enums/user-role.enum';
import { useColorScheme } from '@/hooks/use-color-scheme';

type NotifIcon =
  | 'calendar.badge.clock'
  | 'creditcard.fill'
  | 'star.fill'
  | 'person.fill'
  | 'envelope.fill'
  | 'checkmark.circle.fill'
  | 'bell.fill';

interface Notification {
  id: string;
  icon: NotifIcon;
  tint: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

function timeAgo(iso: string): string {
  const date = new Date(iso);
  const diff = Math.max(0, Date.now() - date.getTime());
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return date.toLocaleDateString();
}

function toLocalNotification(n: ApiNotification): Notification {
  return {
    id: n.id,
    icon: ((n.iconKey ?? 'bell.fill') as NotifIcon),
    tint: n.tint ?? '#0FA678',
    title: n.title,
    message: n.message,
    time: timeAgo(n.createdAt),
    unread: !n.readAt,
  };
}

function Notifications() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();

  const role = useMemo(() => parseUserRole(params.role), [params.role]);

  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    setLoading(true);
    NotificationsService.list()
      .then((list) => {
        if (active) setItems(list.map(toLocalNotification));
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [role]);

  // Track the currently-open swipeable so opening a new one closes the old.
  const openSwipeableRef = useRef<SwipeableMethods | null>(null);
  const swipeableRefs = useRef<Map<string, SwipeableMethods>>(new Map());

  const unreadCount = items.filter((n) => n.unread).length;
  const selectedCount = selectedIds.size;
  const allSelected = selectedCount > 0 && selectedCount === items.length;

  const closeAllSwipeables = () => {
    swipeableRefs.current.forEach((ref) => ref?.close?.());
    openSwipeableRef.current = null;
  };

  const exitSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  useEffect(() => {
    if (!selectionMode) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      exitSelection();
      return true;
    });
    return () => sub.remove();
  }, [selectionMode]);

  const enterSelectionWith = (id: string) => {
    closeAllSwipeables();
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markAllRead = () => {
    setItems((list) => list.map((n) => ({ ...n, unread: false })));
    NotificationsService.markAllRead().catch(() => {});
  };

  const selectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((n) => n.id)));
    }
  };

  const deleteIds = (ids: string[]) => {
    ids.forEach((id) => {
      swipeableRefs.current.get(id)?.close?.();
      swipeableRefs.current.delete(id);
    });
    setItems((list) => list.filter((n) => !ids.includes(n.id)));
    if (ids.length === 1) {
      NotificationsService.remove(ids[0]).catch(() => {});
    } else if (ids.length > 1) {
      NotificationsService.bulkRemove(ids).catch(() => {});
    }
  };

  const deleteSingle = (id: string) => {
    deleteIds([id]);
  };

  const deleteSelected = () => {
    if (selectedCount === 0) return;
    Alert.alert(
      selectedCount === 1 ? 'Delete notification?' : 'Delete notifications?',
      selectedCount === 1
        ? 'This notification will be removed.'
        : `${selectedCount} notifications will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteIds(Array.from(selectedIds));
            exitSelection();
          },
        },
      ],
    );
  };

  const openDetail = (n: Notification) => {
    // Mark as read when opened.
    if (n.unread) {
      setItems((list) =>
        list.map((x) => (x.id === n.id ? { ...x, unread: false } : x)),
      );
      NotificationsService.markRead(n.id).catch(() => {});
    }
    router.push({
      pathname: '/notification-detail',
      params: {
        id: n.id,
        title: n.title,
        message: n.message,
        time: n.time,
        icon: n.icon,
        tint: n.tint,
      },
    });
  };

  const handleRowPress = (n: Notification) => {
    if (selectionMode) {
      toggleSelect(n.id);
      return;
    }
    closeAllSwipeables();
    openDetail(n);
  };

  const handleRowLongPress = (n: Notification) => {
    if (selectionMode) return;
    enterSelectionWith(n.id);
  };

  const headerActions: HeaderAction[] = selectionMode
    ? [
        {
          label: allSelected ? 'Deselect' : 'Select All',
          onPress: selectAll,
        },
        {
          icon: 'trash.fill',
          onPress: deleteSelected,
          destructive: true,
          accessibilityLabel: 'Delete selected',
        },
      ]
    : unreadCount > 0
      ? [
          {
            label: 'Mark all',
            onPress: markAllRead,
            accessibilityLabel: 'Mark all as read',
          },
        ]
      : [];

  const renderRightActions =
    (item: Notification) =>
    (_progress: SharedValue<number>, drag: SharedValue<number>) => (
      <SwipeDeleteAction drag={drag} onPress={() => deleteSingle(item.id)} />
    );

  const renderRow = ({ item }: { item: Notification }) => {
    const selected = selectedIds.has(item.id);
    const rowContent = (
      <Pressable
        onPress={() => handleRowPress(item)}
        onLongPress={() => handleRowLongPress(item)}
        delayLongPress={300}
        android_ripple={{ color: `${palette.tint}14`, borderless: false }}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: palette.surface,
            borderColor: selected ? palette.tint : palette.border,
            borderWidth: selected ? 1.5 : 1,
            shadowColor: scheme === 'dark' ? '#000' : '#0F766E',
            opacity: pressed ? 0.9 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={item.title}
        accessibilityState={{ selected }}
      >
        {selectionMode ? (
          <View
            style={[
              styles.checkbox,
              selected
                ? { backgroundColor: palette.tint, borderColor: palette.tint }
                : { borderColor: palette.border },
            ]}
          >
            {selected ? (
              <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
            ) : null}
          </View>
        ) : null}

        <View style={[styles.iconWrap, { backgroundColor: `${item.tint}22` }]}>
          <IconSymbol name={item.icon} size={20} color={item.tint} />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, { color: palette.text }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {item.unread && !selectionMode ? (
              <View style={[styles.dot, { backgroundColor: palette.tint }]} />
            ) : null}
          </View>
          <Text
            style={[styles.message, { color: palette.textMuted }]}
            numberOfLines={2}
          >
            {item.message}
          </Text>
          <Text style={[styles.time, { color: palette.textMuted }]}>
            {item.time}
          </Text>
        </View>
      </Pressable>
    );

    if (selectionMode) return rowContent;

    return (
      <ReanimatedSwipeable
        ref={
          ((ref: SwipeableMethods | null) => {
            if (ref) swipeableRefs.current.set(item.id, ref);
            else swipeableRefs.current.delete(item.id);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }) as any
        }
        renderRightActions={renderRightActions(item)}
        rightThreshold={40}
        friction={2}
        overshootRight={false}
        onSwipeableWillOpen={() => {
          const current = swipeableRefs.current.get(item.id);
          if (
            openSwipeableRef.current &&
            openSwipeableRef.current !== current
          ) {
            openSwipeableRef.current.close();
          }
          openSwipeableRef.current = current ?? null;
        }}
      >
        {rowContent}
      </ReanimatedSwipeable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={palette.tint} />
      <ScreenHeader
        title={selectionMode ? `${selectedCount} selected` : 'Notifications'}
        leftIcon={selectionMode ? 'xmark' : 'chevron.left'}
        onBack={selectionMode ? exitSelection : undefined}
        rightActions={headerActions}
      />

      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          loading ? (
            <View style={styles.empty}>
              <ActivityIndicator color={palette.tint} />
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={[styles.emptyTitle, { color: palette.text }]}>
                No notifications yet
              </Text>
              <Text style={[styles.emptyMessage, { color: palette.textMuted }]}>
                You&apos;re all caught up. Check back later.
              </Text>
            </View>
          )
        }
        renderItem={renderRow}
      />

      {!selectionMode && items.length > 0 ? (
        <View
          style={[
            styles.hint,
            {
              backgroundColor: palette.surfaceAlt,
              borderTopColor: palette.border,
            },
          ]}
        >
          <Text style={[styles.hintText, { color: palette.textMuted }]}>
            Swipe left to delete • Long-press to select multiple
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radii.lg,
    padding: Spacing.md,
    gap: Spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyMessage: {
    fontSize: 13,
    textAlign: 'center',
  },
  hint: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  hintText: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  swipeActionWrap: {
    justifyContent: 'center',
    paddingLeft: Spacing.md,
    width: 112,
  },
  swipeDelete: {
    flex: 1,
    backgroundColor: '#DC2626',
    borderRadius: Radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    shadowColor: '#991B1B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  swipeGlow: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: Spacing.md - 4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: Radii.lg + 4,
  },
  swipeIconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeDeleteLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});

function SwipeDeleteAction({
  drag,
  onPress,
}: {
  drag: SharedValue<number>;
  onPress: () => void;
}) {
  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          drag.value,
          [-120, -80, -40, 0],
          [1.1, 1, 0.7, 0.3],
          Extrapolation.CLAMP,
        ),
      },
      {
        rotate: `${interpolate(
          drag.value,
          [-120, -40, 0],
          [0, -10, -30],
          Extrapolation.CLAMP,
        )}deg`,
      },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      drag.value,
      [-100, -60, -30],
      [1, 0.5, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          drag.value,
          [-100, -30],
          [0, 6],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      drag.value,
      [-120, -60, 0],
      [0.35, 0.18, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View style={styles.swipeActionWrap}>
      <Animated.View style={[styles.swipeGlow, glowStyle]} />
      <Pressable
        onPress={onPress}
        style={styles.swipeDelete}
        accessibilityRole="button"
        accessibilityLabel="Delete notification"
      >
        <Animated.View style={[styles.swipeIconRing, iconStyle]}>
          <IconSymbol name="trash.fill" size={22} color="#FFFFFF" />
        </Animated.View>
        <Animated.Text style={[styles.swipeDeleteLabel, labelStyle]}>
          DELETE
        </Animated.Text>
      </Pressable>
    </View>
  );
}

export default Notifications;
