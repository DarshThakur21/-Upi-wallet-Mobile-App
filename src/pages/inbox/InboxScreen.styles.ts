import type { ViewStyle, TextStyle } from 'react-native';
import { radius, typography, type ThemeColors } from '../../theme/tokens';

export const styles = {
  page: (colors: ThemeColors): ViewStyle => ({ flex: 1, backgroundColor: colors.background }),
  header: ({ padding: 16, gap: 20 }) satisfies ViewStyle,
  tabs: (colors: ThemeColors): ViewStyle => ({ flexDirection: 'row', gap: 8, backgroundColor: colors.navigation, padding: 6, borderRadius: radius.card }),
  tab: (colors: ThemeColors, section: 'transactions' | 'messages', tab: 'transactions' | 'messages'): ViewStyle => ({ flex: 1, minHeight: 52, padding: 12, gap: 8, alignItems: 'center', justifyContent: 'center', borderRadius: radius.card, backgroundColor: section === tab ? colors.charcoal : 'transparent' }),
  tabLabel: (colors: ThemeColors, section: 'transactions' | 'messages', tab: 'transactions' | 'messages'): TextStyle => ({ fontWeight: '600', color: section === tab ? colors.inverse : colors.text }),
  body: ({ flex: 1, paddingHorizontal: 16 }) satisfies ViewStyle,
  list: ({ gap: 12 }) satisfies ViewStyle,
  notice: (colors: ThemeColors, rowHeight: number): ViewStyle => ({ height: rowHeight, borderRadius: radius.card, backgroundColor: colors.lavender, padding: 16, gap: 8 }),
  noticeTitle: (colors: ThemeColors): TextStyle => ({ ...typography.card, color: colors.text }),
  noticeMessage: (colors: ThemeColors): TextStyle => ({ ...typography.body, color: colors.muted }),
  timestamp: (colors: ThemeColors): TextStyle => ({ fontSize: 12, color: colors.muted }),
  empty: (colors: ThemeColors): TextStyle => ({ color: colors.muted }),
  pagination: ({ minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }) satisfies ViewStyle,
  modalBackdrop: ({ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.4)' }) satisfies ViewStyle,
  modalPanel: (colors: ThemeColors): ViewStyle => ({ backgroundColor: colors.surface, borderRadius: radius.card, padding: 24, maxHeight: '85%' }),
  modalContent: ({ gap: 16 }) satisfies ViewStyle,
};
