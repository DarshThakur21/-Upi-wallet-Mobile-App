import { styles } from './ReceiptScreen.styles';
import { Text } from '../../components/Text';
import { useEffect } from 'react';
import { } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { api, money } from '../../services/accountApi';
import { Button, Card, Load, Screen, useScreenStyles } from '../../components/screen/Screen';
import { TransactionAnimation } from '../../components/transaction/TransactionAnimation';
import { store } from '../../store/wallet';

export default function Receipt() {
  const st = useScreenStyles();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cached = api.endpoints.transaction.useQueryState(id);
  const finished = ['SUCCESS', 'FAILED', 'REVERSED', 'COMPLETED'].includes(
    cached.currentData?.status ?? '',
  );
  const q = api.useTransactionQuery(id, {
    pollingInterval: finished ? 0 : 2500,
  });
  const tx = q.currentData;
  useEffect(() => {
    if (finished) {
      store.dispatch(api.util.invalidateTags(['Wallet', 'Activity', 'Inbox']));
    }
  }, [finished, id]);
  return (
    <Screen dark title="Transaction details">
      {tx && ['SUCCESS', 'COMPLETED'].includes(tx.status) && <TransactionAnimation complete label={tx.type === 'DEPOSIT' ? 'Deposit complete' : 'Transfer complete'} />}
      {tx && !finished && <TransactionAnimation label="Confirming transaction..." />}
      {tx && (
        <Card dark title={tx.type}>
          <Text style={styles.amount}>
            {money(tx.amount)}
          </Text>
          <Text style={st.light}>{tx.status}</Text>
          {Object.entries({
            From: tx.senderUpiId,
            To: tx.receiverUpiId,
            Remarks: tx.remarks,
            Reason: tx.failureReason,
            'Transaction ID': tx.transactionId,
            Date: new Date(tx.createdAt || tx.initiatedAt).toLocaleString(),
          })
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <Text key={k} selectable style={st.dim}>
                {k} · {v}
              </Text>
            ))}
        </Card>
      )}
      {q.isError ? (
        <Button label="Retry status check" onPress={q.refetch} />
      ) : (
        !tx && <Load failed={false} retry={q.refetch} />
      )}
    </Screen>
  );
}
