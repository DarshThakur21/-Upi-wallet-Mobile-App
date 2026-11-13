import type { TextStyle, ViewStyle, ImageStyle, PressableStateCallbackType } from 'react-native';
import { typography, type ThemeColors } from '../../theme/tokens';

export const styles = {
  sectionHeader: (({ pressed }) => ({ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 16, opacity: pressed ? 0.6 : 1 })) satisfies (state: PressableStateCallbackType) => ViewStyle,
  sectionTitle: (colors: ThemeColors): TextStyle => ({ ...typography.card, flex: 1, color: colors.text }),
  sectionBody: ({ gap: 12, paddingTop: 8 }) satisfies ViewStyle,
  identityRow: ({ flexDirection: 'row', alignItems: 'center', gap: 14 }) satisfies ViewStyle,
  avatar: ({ height: 56, width: 56, borderRadius: 28 }) satisfies ImageStyle,
  avatarFallback: (colors: ThemeColors): ViewStyle => ({
                height: 56,
                width: 56,
                borderRadius: 28,
                backgroundColor: colors.lavender,
                alignItems: 'center',
                justifyContent: 'center',
              }),
  initials: ({ fontSize: 22, fontWeight: '700' }) satisfies TextStyle,
  identityDetails: ({ flex: 1, gap: 4 }) satisfies ViewStyle,
  name: ({ fontWeight: '700', fontSize: 21 }) satisfies TextStyle,
  fieldLabel: (colors: ThemeColors): TextStyle => ({ color: colors.muted, fontSize: 12 }),
  themeToggle: (colors: ThemeColors): (state: PressableStateCallbackType) => ViewStyle => (({ pressed }) => ({ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.lavender, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })),
  error: (colors: ThemeColors): TextStyle => ({ color: colors.error }),
};
