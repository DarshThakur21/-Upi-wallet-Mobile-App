import type { TextStyle, ViewStyle, Animated } from 'react-native';
import { typography, type ThemeColors } from '../../theme/tokens';

export const styles = {
  container: ({ alignItems: 'center', padding: 32, gap: 20 }) satisfies ViewStyle,
  bubble: (colors: ThemeColors, reduceMotion: boolean, progress: Animated.Value): Animated.WithAnimatedValue<ViewStyle> => ({ width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: colors.ring,
      backgroundColor: colors.charcoal, alignItems: 'center', justifyContent: 'center',
      transform: [{ scale: reduceMotion ? 1 : progress.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.08] }) }] }),
  symbol: (colors: ThemeColors): TextStyle => ({ fontSize: 38, color: colors.inverse }),
  title: (colors: ThemeColors): TextStyle => ({ ...typography.card, color: colors.text, textAlign: 'center' }),
  hint: (colors: ThemeColors): TextStyle => ({ color: colors.muted, textAlign: 'center' }),
};
