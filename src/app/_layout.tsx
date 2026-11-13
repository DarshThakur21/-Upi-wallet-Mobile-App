import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { store, walletApi } from '../store/wallet';
import { useSession } from '../auth/session';

export default function Layout() {
  return <ThemeProvider><AppLayout /></ThemeProvider>;
}

function AppLayout() {
  const { colors, mode } = useTheme();
  const session = useSession();
  useEffect(() => {
    if (!session) store.dispatch(walletApi.util.resetApiState());
  }, [session]);
  return (
    <Provider store={store}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="activity" />
          <Stack.Screen name="wallets" />
          <Stack.Screen name="payment" />
          <Stack.Screen name="receipt" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="qr" />
          <Stack.Screen name="inbox" />
        </Stack.Protected>
      </Stack>
    </Provider>
  );
}
