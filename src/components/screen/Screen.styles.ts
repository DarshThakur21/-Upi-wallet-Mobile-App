import type { TextStyle, ViewStyle, PressableStateCallbackType } from 'react-native';
import type { ThemeColors } from '../../theme/tokens';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, shadows, typography } from '../../theme/tokens';

export function useScreenStyles() {
  const { colors } = useTheme();
  return StyleSheet.create({
  page: { padding: 16, gap: 24, paddingBottom: 32 },
  card: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: radius.card,
    boxShadow: shadows.row,
    gap: 12,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  inverseCard: { backgroundColor: colors.charcoal },
  input: {
    backgroundColor: colors.subtle,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.input,
    padding: 12,
    color: colors.text,
    fontSize: 16,
  },
  light: { color: colors.inverse },
  dim: { color: colors.inverseMuted },
  error: { color: colors.error },
});
}

export const styles = {
  button: (color: string, disabled: boolean): (state: PressableStateCallbackType) => ViewStyle => (({ pressed }) => ({
        backgroundColor: color,
        borderRadius: radius.input,
        minHeight: 48,
        paddingHorizontal: 16,
        paddingVertical: 12,
        opacity: disabled || pressed ? 0.6 : 1,
      })),
  buttonLabel: ({ color: 'white', fontWeight: '700', textAlign: 'center' }) satisfies TextStyle,
  page: (colors: ThemeColors): ViewStyle => ({ flex: 1, backgroundColor: colors.background }),
  backButton: ({ alignSelf: 'flex-start', paddingVertical: 8 }) satisfies ViewStyle,
  backLabel: (colors: ThemeColors): TextStyle => ({ color: colors.muted }),
  header: ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }) satisfies ViewStyle,
  title: (color: string): TextStyle => ({ color, ...typography.screen, flex: 1 }),
  cardTitle: (colors: ThemeColors, dark: boolean): TextStyle => ({
            fontSize: 18,
            fontWeight: '700',
            color: dark ? 'white' : colors.text,
          }),
  field: ({ gap: 6 }) satisfies ViewStyle,
  fieldLabel: (colors: ThemeColors): TextStyle => ({ color: colors.muted, fontSize: 13, fontWeight: '600' }),
};
