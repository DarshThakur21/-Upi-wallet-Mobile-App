import type { ViewStyle, TextStyle } from 'react-native';
import { type ThemeColors } from '../../theme/tokens';

export const styles = {
  progressOverlay: (colors: ThemeColors): ViewStyle => ({ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }),
  amount: ({ fontSize: 32, fontWeight: '700' }) satisfies TextStyle,
};
