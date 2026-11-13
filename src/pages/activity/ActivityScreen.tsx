import { styles } from './ActivityScreen.styles';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../components/Text';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { api, money } from '../../services/accountApi';
import { typography } from '../../theme/tokens';
import { useSession } from '../../auth/session';
import { Button, Card, Load, Screen, useScreenStyles } from '../../components/screen/Screen';

export default function Activity() {
  const st = useScreenStyles();
  const { colors } = useTheme();
  const [page, setPage] = useState(0);
  const user = useSession()?.user;
  const query = api.useHistoryQuery(page, { pollingInterval: 15000 });
  const data = query.currentData;
  return (
    <Screen dark title="Transactions" showBack={false}>
      <Card dark title="Your money in motion">
        <Text style={st.dim}>Transfers, deposits, and every little detail.</Text>
        <View style={st.actions}>
          <Button label="Transfer" onPress={() => router.push('/payment')} />
          <Button label="+ Deposit" onPress={() => router.push({ pathname: '/payment', params: { mode: 'deposit' } })} />
        </View>
      </Card>
      <Text style={typography.section}>Recent activity</Text>
      {query.isError && <Load failed retry={query.refetch} />}
      {data ? (
        <>
          <Text style={styles.summary(colors)}>
            {data.totalElements} transactions · Page {page + 1} of{' '}
            {Math.max(1, data.totalPages)}
          </Text>
          {data.transactions.map((tx) => {
            const debit = tx.senderId === user?.id && tx.type !== 'DEPOSIT';
            return (
              <Pressable
                key={tx.transactionId}
                accessibilityRole="button"
                onPress={() =>
                  router.push({
                    pathname: '/receipt',
                    params: { id: tx.transactionId },
                  })
                }
              >
                <View style={styles.timelineRow}>
                <View style={styles.timelineRail}><View style={styles.timelineDot(colors)} /><View style={styles.timelineLine(colors)} /></View>
                <View style={styles.transaction}>
                  <Text style={styles.metadata(colors)}>
                    {tx.type} · {tx.status}
                  </Text>
                  <Text
                    style={styles.amount(colors)}
                  >
                    {debit ? '−' : '+'}
                    {money(tx.amount)}
                  </Text>
                  <Text style={styles.counterparty(colors)}>
                    {debit
                      ? 'To ' + tx.receiverUpiId
                      : tx.senderUpiId
                        ? 'From ' + tx.senderUpiId
                        : 'Wallet deposit'}
                  </Text>
                  <Text style={styles.timestamp(colors)}>
                    {new Date(tx.createdAt || tx.initiatedAt).toLocaleString()}
                  </Text>
                </View>
                </View>
              </Pressable>
            );
          })}
          {!data.transactions.length && (
            <Text style={styles.empty(colors)}>No transactions yet.</Text>
          )}
        </>
      ) : (
        !query.isError && <Load failed={false} retry={query.refetch} />
      )}
      <View style={st.actions}>
        {page > 0 && (
          <Button label="Previous" onPress={() => setPage(page - 1)} />
        )}
        {data?.hasNext && (
          <Button label="Next" onPress={() => setPage(page + 1)} />
        )}
      </View>
    </Screen>
  );
}
