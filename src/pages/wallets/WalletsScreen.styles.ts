import type { TextStyle, ViewStyle, PressableStateCallbackType } from 'react-native';
import { radius, typography, type ThemeColors } from '../../theme/tokens';

export const styles = {
  signOut: (signingOut: boolean): (state: PressableStateCallbackType) => ViewStyle => (({ pressed }) => ({ width: 48, height: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed || signingOut ? 0.5 : 1 })),
  hero: (colors: ThemeColors): ViewStyle => ({ backgroundColor: colors.charcoal, borderRadius: radius.feature, padding: 24, gap: 12 }),
  greeting: (colors: ThemeColors): TextStyle => ({ color: colors.inverseMuted }),
  headline: (colors: ThemeColors): TextStyle => ({ ...typography.screen, color: colors.inverse }),
  balanceButton: (colors: ThemeColors): (state: PressableStateCallbackType) => ViewStyle => (({ pressed }) => ({ width: 48, height: 48, borderRadius: radius.circle, backgroundColor: colors.inverse, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })),
  modalBackdrop: ({ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 }) satisfies ViewStyle,
  modalPanel: (colors: ThemeColors): ViewStyle => ({ maxHeight: '90%', width: '100%', maxWidth: 480, alignSelf: 'center', backgroundColor: colors.surface, borderRadius: radius.card, padding: 20 }),
  closeButton: ({ alignSelf: 'flex-end', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }) satisfies ViewStyle,
  modalContent: ({ gap: 16 }) satisfies ViewStyle,
  hint: (colors: ThemeColors): TextStyle => ({ color: colors.muted }),
  walletHeading: ({ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }) satisfies ViewStyle,
  walletCard: (colors: ThemeColors, index: number): ViewStyle => ({ padding: 24, borderRadius: radius.feature, gap: 16, backgroundColor: index % 2 ? colors.lavender : colors.charcoal }),
  walletName: (colors: ThemeColors, index: number): TextStyle => ({ ...typography.card, color: index % 2 ? colors.text : colors.inverse }),
  balance: (colors: ThemeColors, index: number): TextStyle => ({ ...typography.screen, color: index % 2 ? colors.text : colors.inverse }),
  balanceLabel: (colors: ThemeColors, index: number): TextStyle => ({ color: index % 2 ? colors.muted : colors.inverseMuted }),
};
