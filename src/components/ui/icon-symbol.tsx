// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'book.fill': 'menu-book',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'graduationcap.fill': 'school',
  'person.2.fill': 'groups',
  'calendar': 'calendar-today',
  'bell.fill': 'notifications',
  'magnifyingglass': 'search',
  'star.fill': 'star',
  'person.fill': 'person',
  'power': 'logout',
  'xmark': 'close',
  'clock.fill': 'schedule',
  'creditcard.fill': 'credit-card',
  'envelope.fill': 'mail',
  'checkmark.circle.fill': 'check-circle',
  'chevron.left': 'chevron-left',
  'gear': 'settings',
  'lock.fill': 'lock',
  'dollarsign.circle.fill': 'attach-money',
  'calendar.badge.clock': 'event-available',
  'briefcase.fill': 'work',
  'trash.fill': 'delete',
  'checkmark': 'check',
  'square.and.pencil': 'edit',
  'mic.fill': 'mic',
  'mic.slash.fill': 'mic-off',
  'video.fill': 'videocam',
  'video.slash.fill': 'videocam-off',
  'phone.down.fill': 'call-end',
  'arrow.triangle.2.circlepath.camera': 'flip-camera-android',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
