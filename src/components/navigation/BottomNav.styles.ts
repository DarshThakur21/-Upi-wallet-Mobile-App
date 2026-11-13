import type { TextStyle, ViewStyle } from 'react-native';
import { radius, shadows, type ThemeColors } from '../../theme/tokens';

export const styles = {
  bar: (colors: ThemeColors): ViewStyle => ({ flexDirection: 'row', paddingVertical: 8, backgroundColor: colors.navigation, boxShadow: shadows.navigation }),
  item: ({ flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center', gap: 3 }) satisfies ViewStyle,
  iconContainer: (colors: ThemeColors, item: { label: string; route: string }): ViewStyle => ({ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.circle,
        backgroundColor: item.label === 'Transfer' ? colors.charcoal : 'transparent',
        borderWidth: item.label === 'Transfer' ? 3 : 0, borderColor: colors.ring }),
  icon: (colors: ThemeColors, item: { label: string; route: string }): TextStyle => ({ fontSize: 24, color: item.label === 'Transfer' ? colors.inverse : colors.text }),
  label: (colors: ThemeColors, item: { label: string; route: string }, path: string): TextStyle => ({ fontSize: 11, color: colors.muted, fontWeight: path === item.route ? '700' : '400' }),
};
