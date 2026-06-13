import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

export interface LogoProps {
  size?: LogoSize;
  source?: ImageSourcePropType;
  shadow?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

function sizeFor(size: LogoSize) {
  switch (size) {
    case 'sm':
      return { box: 48, icon: 24 };
    case 'md':
      return { box: 72, icon: 34 };
    case 'lg':
      return { box: 88, icon: 42 };
    case 'xl':
    default:
      return { box: 108, icon: 56 };
  }
}

function Logo({ size = 'lg', source, shadow = true, containerStyle }: LogoProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const { box, icon } = sizeFor(size);

  return (
    <View
      style={[
        styles.logo,
        {
          width: box,
          height: box,
          borderRadius: Radii.xl,
          backgroundColor: palette.tint,
          shadowColor: shadow ? palette.tint : 'transparent',
          shadowOpacity: shadow ? 0.25 : 0,
          elevation: shadow ? 10 : 0,
        },
        containerStyle,
      ]}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: box * 0.72, height: box * 0.72 }}
          resizeMode="contain"
        />
      ) : (
        <IconSymbol name="book.fill" size={icon} color="#FFFFFF" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 18,
  },
});

export default Logo;
