import { styles, useScreenStyles } from './Screen.styles';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../Text';
import type { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../../theme/tokens';
import { BottomNav } from '../navigation/BottomNav';

export const ink = colors.text, muted = colors.muted, blue = colors.charcoal, night = colors.charcoal, slate = colors.charcoal;
export function Button({
  label,
  onPress,
  color = ink,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={styles.button(color, disabled)}
    >
      <Text style={styles.buttonLabel}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Screen({
  title,
  showBack = true,
  headerRight,
  children,
}: PropsWithChildren<{ title: string; dark?: boolean; showBack?: boolean; headerRight?: ReactNode }>) {
  const { colors, mode } = useTheme();
  const st = useScreenStyles();
  const color = colors.text;
  return (
    <SafeAreaView
      style={styles.page(colors)}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={st.page}
      >
        {showBack && <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/')
          }
          style={styles.backButton}
        >
          <Text style={styles.backLabel(colors)}>‹ Back</Text>
        </Pressable>}
        <View style={styles.header}>
        <Text
          accessibilityRole="header"
          style={styles.title(color)}
        >
          {title}
        </Text>
        {headerRight}
        </View>
        {children}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}
export function Card({
  title,
  children,
  dark = false,
}: PropsWithChildren<{ title?: string; dark?: boolean }>) {
  const { colors } = useTheme();
  const st = useScreenStyles();
  return (
    <View
      style={[
        st.card,
        dark && st.inverseCard,
      ]}
    >
      {title && (
        <Text
          style={styles.cardTitle(colors, dark)}
        >
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  const { colors } = useTheme();
  const st = useScreenStyles();
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel(colors)}>
        {label}
      </Text>
      <TextInput
        autoCapitalize="none"
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...props}
        style={st.input}
      />
    </View>
  );
}
export function Load({
  failed,
  retry,
}: {
  failed: boolean;
  retry: () => void;
}) {
  const { colors } = useTheme();
  return failed ? (
    <Button label="Couldn’t load · Retry" onPress={retry} />
  ) : (
    <ActivityIndicator color={colors.text} />
  );
}

export { useScreenStyles } from './Screen.styles';
