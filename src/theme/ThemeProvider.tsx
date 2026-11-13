import { createContext, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { colors as lightColors } from './tokens';

const darkColors = {
  ...lightColors,
  background: '#151615', navigation: '#1C1D1C', surface: '#222422',
  subtle: '#2B2D2B', lavender: '#2D2C3B', text: '#F4F4F2', muted: '#B9BCB8',
  border: '#424540', error: '#FFAAA3', success: '#8ED8AD',
};
type Mode = 'light' | 'dark';
const ThemeContext = createContext({ colors: lightColors, mode: 'light' as Mode, toggle: () => {}, storageError: '' });
const key = 'wallet.appearance';

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<Mode>('light');
  const [storageError, setStorageError] = useState('');
  const changed = useRef(false);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    const read = Platform.OS === 'web'
      ? Promise.resolve().then(() => localStorage.getItem(key))
      : SecureStore.getItemAsync(key);
    read.then(value => {
      if (active && !changed.current && (value === 'light' || value === 'dark')) setMode(value);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  function toggle() {
    const next = mode === 'light' ? 'dark' : 'light';
    changed.current = true;
    setMode(next);
    setStorageError('');
    writes.current = writes.current.then(async () => {
      if (Platform.OS === 'web') localStorage.setItem(key, next);
      else await SecureStore.setItemAsync(key, next);
    }).catch(() => setStorageError('Theme changed, but could not be saved for next time.'));
  }
  return <ThemeContext.Provider value={{ colors: mode === 'dark' ? darkColors : lightColors, mode, toggle, storageError }}>{children}</ThemeContext.Provider>;
}
export const useTheme = () => useContext(ThemeContext);
