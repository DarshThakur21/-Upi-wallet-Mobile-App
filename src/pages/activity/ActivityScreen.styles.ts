import type { ViewStyle, TextStyle } from 'react-native';
import { type ThemeColors } from '../../theme/tokens';

export const styles = {
  summary: (colors: ThemeColors): TextStyle => ({ color: colors.muted }),
  timelineRow: ({ flexDirection: 'row', gap: 16 }) satisfies ViewStyle,
  timelineRail: ({ alignItems: 'center', width: 16 }) satisfies ViewStyle,
  timelineDot: (colors: ThemeColors): ViewStyle => ({ width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: colors.charcoal }),
  timelineLine: (colors: ThemeColors): ViewStyle => ({ flex: 1, width: 1, backgroundColor: colors.border, marginTop: 8 }),
  transaction: ({ flex: 1, gap: 10, paddingBottom: 20 }) satisfies ViewStyle,
  metadata: (colors: ThemeColors): TextStyle => ({ color: colors.muted }),
  amount: (colors: ThemeColors): TextStyle => ({
                      fontSize: 24,
                      fontWeight: '700',
                      color: colors.text,
                    }),
  counterparty: (colors: ThemeColors): TextStyle => ({ color: colors.text }),
  timestamp: (colors: ThemeColors): TextStyle => ({ color: colors.muted }),
  empty: (colors: ThemeColors): TextStyle => ({ color: colors.text }),
};
