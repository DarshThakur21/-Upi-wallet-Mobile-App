import { styles } from './WalletsScreen.styles';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../components/Text';
import { useCallback, useEffect, useRef, useState } from 'react';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { AppState, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { signOut, useSession } from '../../auth/session';
import { walletApi } from '../../store/wallet';
import { api, message, money } from '../../services/accountApi';
import { Button, Card, Field, Load, Screen, useScreenStyles } from '../../components/screen/Screen';
import { typography } from '../../theme/tokens';

function WalletContent({ id, name }: { id: string; name: string }) {
  const st = useScreenStyles();
  const { colors } = useTheme();
  const [unlocked, setUnlocked] = useState(false);
  const [pinModal, setPinModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [verify, verification] = api.useVerifyPinMutation();
  const status = api.usePinQuery();
  const wallets = walletApi.useWalletsQuery(id, { skip: !unlocked, refetchOnMountOrArgChange: true });
  const generation = useRef(0);
  const submitting = useRef(false);
  const lock = useCallback(() => {
    generation.current += 1;
    setUnlocked(false);
    setPinModal(false);
    setPin('');
    setError('');
  }, []);
  useFocusEffect(useCallback(() => { lock(); return lock; }, [lock]));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => { if (state !== 'active') lock(); });
    return () => subscription.remove();
  }, [lock]);
  async function unlock() {
    if (submitting.current) return;
    if (!/^\d{6}$/.test(pin)) { setError('Enter your six-digit UPI PIN.'); return; }
    const attempt = generation.current;
    submitting.current = true;
    setError('');
    try {
      const result = await verify(pin).unwrap();
      if (attempt === generation.current) {
        if (result.verified) setUnlocked(true);
        else setError('PIN could not be verified.');
      }
    } catch (e) { if (attempt === generation.current) setError(message(e)); }
    finally { setPin(''); submitting.current = false; }
  }
  async function logout() {
    if (signingOut) return;
    lock();
    setSigningOut(true);
    setSignOutError('');
    try { await signOut(); }
    catch { setSignOutError('Could not clear this session. Try again.'); }
    finally { setSigningOut(false); }
  }
  return <Screen title="My wallet" showBack={false} headerRight={
    <Pressable accessibilityRole="button" accessibilityLabel="Sign out" accessibilityState={{ disabled: signingOut }}
      disabled={signingOut} onPress={logout}
      style={styles.signOut(signingOut)}>
      <SimpleLineIcons name="logout" size={24} color={colors.text} />
    </Pressable>
  }>
    <View style={styles.hero(colors)}>
      <Text style={styles.greeting(colors)}>Hello, {name}</Text>
      <Text style={styles.headline(colors)}>{'Your money,\nyour everyday.'}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Open wallet balances" onPress={() => { setError(''); setPinModal(true); }}
        style={styles.balanceButton(colors)}>
        <SimpleLineIcons name="wallet" size={22} color={colors.charcoal} />
      </Pressable>
    </View>
    <Modal visible={pinModal} transparent animationType="fade" onRequestClose={lock}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBackdrop}>
        <View accessibilityViewIsModal style={styles.modalPanel(colors)}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close wallet dialog" onPress={lock}
            style={styles.closeButton}>
            <SimpleLineIcons name="close" size={20} color={colors.text} />
          </Pressable>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalContent}>
    {!unlocked ? <Card title="Enter UPI PIN">
      <Text style={styles.hint(colors)}>Verify your UPI PIN to view your wallets.</Text>
      {status.isFetching ? <Load failed={false} retry={status.refetch} /> : status.isError ? <Load failed retry={status.refetch} /> : status.data?.configured && !status.data.locked ? <>
        <Field label="Six-digit UPI PIN" value={pin} onChangeText={value => setPin(value.replace(/\D/g, ''))}
          autoFocus secureTextEntry keyboardType="number-pad" maxLength={6} editable={!verification.isLoading} />
        <Button label={verification.isLoading ? 'Verifying...' : 'Verify PIN'} disabled={verification.isLoading} onPress={unlock} />
      </> : <>
        <Text>{status.data?.locked ? 'Your PIN is temporarily locked. Try again later or reset it in Profile.' : 'Set up your UPI PIN before viewing balances.'}</Text>
        <Button label="Manage UPI PIN" onPress={() => { lock(); router.push('/profile'); }} />
      </>}
    </Card> : <>
      <View style={styles.walletHeading}>
        <Text style={typography.section}>Your wallets</Text>
      </View>
      {wallets.isFetching ? <Load failed={false} retry={wallets.refetch} /> : wallets.isError ? <Load failed retry={wallets.refetch} /> : <>
        {wallets.currentData?.map((wallet, index) => <View key={wallet.walletId} style={styles.walletCard(colors, index)}>
          <Text style={styles.walletName(colors, index)}>{wallet.goalName || wallet.walletType}</Text>
          <Text style={styles.balance(colors, index)}>{money(wallet.balance)}</Text>
          <Text style={styles.balanceLabel(colors, index)}>Available balance</Text>
        </View>)}
        {!wallets.currentData?.length && <Text>No wallets yet.</Text>}
      </>}
    </>}
    {!!error && <Text accessibilityRole="alert" style={st.error}>{error}</Text>}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
    {!!signOutError && <Text accessibilityRole="alert" style={st.error}>{signOutError}</Text>}
    <Text style={typography.section}>Quick actions</Text>
    <View style={st.actions}>
      <Button label="Transfer" onPress={() => router.push('/payment')} />
      <Button label="+ Deposit" onPress={() => router.push({ pathname: '/payment', params: { mode: 'deposit' } })} />
      <Button label="My QR" onPress={() => router.push('/qr')} />
    </View>
  </Screen>;
}
export default function Wallets() {
  const session = useSession();
  return session ? <WalletContent key={session.user.id} id={session.user.id} name={session.user.name || session.user.username} /> : null;
}
