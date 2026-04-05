import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../constants';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export function ScreenContainer({ children, style, padded = true }: ScreenContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: padded ? Spacing.lg : 0,
          paddingRight: padded ? Spacing.lg : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
});
