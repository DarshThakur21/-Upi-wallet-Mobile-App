import { styles } from './PaymentScreen.styles';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../components/Text';
import { useRef, useState } from 'react';
import { Modal, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { uuid } from 'expo';
import { sha256 } from 'js-sha256';
import * as SecureStore from 'expo-secure-store';
import { api, message, money } from '../../services/accountApi';
import { TransactionAnimation } from '../../components/transaction/TransactionAnimation';

import { useSession } from '../../auth/session';
import { Button, Card, Field, Screen, blue, useScreenStyles } from '../../components/screen/Screen';

export default function Payment() {
  const st = useScreenStyles();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ mode?: string; recipient?: string }>();
  const deposit = params.mode === 'deposit';
  const user = useSession()?.user;
  const profile = api.useProfileQuery();
  const pinStatus = api.usePinQuery(undefined, { skip: deposit });
  const [recipient, setRecipient] = useState(params.recipient ?? '');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [pin, setPin] = useState('');
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [error, setError] = useState('');
  const [pay] = api.usePayMutation();
  const target = deposit ? profile.data?.upiID : recipient.trim().toLowerCase();
  function validate() {
    if (!target || !/^[a-z0-9._-]+@wallet$/.test(target))
      return 'Enter a valid recipient ID ending in @wallet.';
    if (!deposit && target === profile.data?.upiID)
      return 'Choose another wallet as the recipient.';
    if (
      !/^\d{1,10}(\.\d{1,2})?$/.test(amount) ||
      Number(amount) < (deposit ? 0.01 : 1)
    )
      return deposit
        ? 'Enter a positive amount with up to two decimal places.'
        : 'Enter at least ₹1 with up to two decimal places.';
    return '';
  }
  async function submit() {
    if (lock.current || !user || !target) return;
    const problem = validate();
    if (problem || (!deposit && !/^\d{6}$/.test(pin))) {
      setError(problem || 'Enter your six-digit UPI PIN.');
      return;
    }
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const fingerprint = JSON.stringify([
        deposit,
        target,
        Number(amount),
        remarks.trim(),
      ]);
      const key = 'payment.' + user.id + '.' + sha256(fingerprint);
      const idempotencyKey =
        (await SecureStore.getItemAsync(key)) ?? uuid.v4();
      await SecureStore.setItemAsync(key, idempotencyKey);
      const base = { idempotencyKey, amount: Number(amount) };
      let tx;
      try {
        tx = await pay(
          deposit
            ? { ...base, upiId: target, description: remarks.trim() }
            : {
                ...base,
                receiverUpiId: target,
                remarks: remarks.trim(),
                upiPin: pin,
              },
        ).unwrap();
      } catch (e) {
        if (
          typeof e === 'object' &&
          e &&
          'status' in e &&
          [400, 401, 403, 422].includes(Number(e.status))
        )
          await SecureStore.deleteItemAsync(key);
        throw e;
      }
      await SecureStore.deleteItemAsync(key);
      router.replace({
        pathname: '/receipt',
        params: { id: tx.transactionId },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : message(e));
    } finally {
      setPin('');
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Screen dark title={deposit ? 'Deposit money' : 'Transfer money'}>
      <Modal visible={busy} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.progressOverlay(colors)}>
          <TransactionAnimation label={deposit ? 'Adding money to your wallet...' : 'Sending your transfer...'} />
        </View>
      </Modal>
      <Card
        title={
          review
            ? 'Review payment'
            : deposit
              ? 'Add to your wallet'
              : 'Payment details'
        }
      >
        {review ? (
          <>
            <Text style={styles.amount}>
              {money(Number(amount))}
            </Text>
            <Text>To · {target}</Text>
            {!!remarks && <Text>{remarks}</Text>}
            {!deposit && (
              <Field
                label="UPI PIN"
                value={pin}
                onChangeText={setPin}
                secureTextEntry
                editable={!busy}
                maxLength={6}
                keyboardType="number-pad"
              />
            )}
            <Button
              disabled={busy}
              color={blue}
              label={
                busy
                  ? 'Submitting…'
                  : deposit
                    ? 'Confirm deposit'
                    : 'Confirm transfer'
              }
              onPress={submit}
            />
            <Button
              disabled={busy}
              label="Edit details"
              onPress={() => {
                setReview(false);
                setPin('');
                setError('');
              }}
            />
          </>
        ) : (
          <>
            {deposit ? (
              <Text>To · {profile.data?.upiID ?? 'Loading your UPI ID…'}</Text>
            ) : (
              <>
                <Field
                  label="Recipient UPI ID"
                  value={recipient}
                  onChangeText={setRecipient}
                  placeholder="friend@wallet"
                />
                <Button
                  label="Scan recipient QR"
                  onPress={() =>
                    router.push({ pathname: '/qr', params: { scan: '1' } })
                  }
                />
              </>
            )}
            <Field
              label="Amount (₹)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
            <Field
              label="Remarks (optional)"
              value={remarks}
              onChangeText={setRemarks}
            />
            {pinStatus.data &&
              (!pinStatus.data.configured || pinStatus.data.locked) && (
                <Button
                  label="Manage UPI PIN in profile"
                  onPress={() => router.push('/profile')}
                />
              )}
            {!deposit && pinStatus.isError && <Button label="Retry PIN status" onPress={pinStatus.refetch} />}
            {profile.isError && (
              <Button label="Retry profile" onPress={profile.refetch} />
            )}
            <Button
              label="Review payment"
              color={blue}
              disabled={
                deposit
                  ? !target
                  : !pinStatus.data?.configured || pinStatus.isFetching || pinStatus.isError || pinStatus.data?.locked
              }
              onPress={() => {
                const problem = validate();
                setError(problem);
                if (!problem) setReview(true);
              }}
            />
          </>
        )}
        {!!error && (
          <Text accessibilityRole="alert" style={st.error}>
            {error}
          </Text>
        )}
      </Card>
    </Screen>
  );
}
