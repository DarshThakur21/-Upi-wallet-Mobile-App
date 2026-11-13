import { Text as NativeText, type TextProps } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export function Text({ style, ...props }: TextProps) {
  const { colors } = useTheme();
  return <NativeText {...props} style={[{ color: colors.text }, style]} />;
}
