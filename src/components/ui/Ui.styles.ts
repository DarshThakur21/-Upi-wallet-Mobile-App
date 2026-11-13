import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, typography } from '../../theme/tokens';

export const interactionStyle = (disabled: boolean, pressed: boolean): ViewStyle => ({
  opacity: disabled || pressed ? 0.65 : 1,
});

export function useUiStyles() {
  const { colors } = useTheme();
  return StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: 24, gap: 16, justifyContent: 'center' },
  title: { ...typography.screen, color: colors.text },
  label: { color: colors.text, fontWeight: '600', fontSize: 15 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.input, padding: 14, color: colors.text, fontSize: 17 },
  button: { backgroundColor: colors.charcoal, padding: 15, borderRadius: radius.input, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: colors.error, fontSize: 15 },
  row: { paddingVertical: 18, paddingHorizontal: 20, backgroundColor: colors.surface, borderRadius: radius.card, gap: 8 },
  amount: { fontSize: 30, fontWeight: '600', color: colors.text },
});
}
