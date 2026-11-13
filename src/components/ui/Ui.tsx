import { interactionStyle, useUiStyles } from './Ui.styles';
import { Text } from '../Text';
import { Pressable } from 'react-native';

export function Action({ label, onPress, disabled = false }: { label: string; onPress: () => void; disabled?: boolean }) {
  const s = useUiStyles();
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [s.button, interactionStyle(disabled, pressed)]}>
    <Text style={s.buttonText}>{label}</Text>
  </Pressable>;
}

export { useUiStyles } from './Ui.styles';
