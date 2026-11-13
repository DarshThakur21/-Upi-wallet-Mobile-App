import { styles } from './InboxScreen.styles';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../components/Text';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { api, message } from '../../services/accountApi';
import { Button, Load, useScreenStyles } from '../../components/screen/Screen';
import { typography } from '../../theme/tokens';
import type { InboxSection, Notice } from './pagination';

export function InboxPage({ section, pageSize, rowHeight }: { section: InboxSection; pageSize: number; rowHeight: number }) {
  const st = useScreenStyles();
  const { colors } = useTheme();
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [selected, setSelected] = useState<Notice | null>(null);
  const q = api.useInboxQuery({ section, page, pageSize }, { pollingInterval: 30000 });
  const [read, state] = api.useReadMutation();
  const data = q.currentData;
  const notices = data?.notifications.filter(n => !dismissed.includes(n.notificationId)) ?? [];
  async function markRead(notice: Notice) {
    setError('');
    try {
      await read(notice.notificationId).unwrap();
      setDismissed(ids => [...ids, notice.notificationId]);
      setSelected(null);
      setPage(0);
    } catch (e) { setError(message(e)); }
  }
  return <>
    <ScrollView contentContainerStyle={styles.list}>
      {q.isError && <Load failed retry={q.refetch} />}
      {!data && !q.isError && <Load failed={false} retry={q.refetch} />}
      {notices.map(n => <Pressable key={n.notificationId} accessibilityRole="button"
        accessibilityLabel={n.title + '. ' + n.message} onPress={() => { setError(''); setSelected(n); }}
        style={styles.notice(colors, rowHeight)}>
        <Text numberOfLines={1} style={styles.noticeTitle(colors)}>{n.title}</Text>
        <Text numberOfLines={2} style={styles.noticeMessage(colors)}>{n.message}</Text>
        <Text numberOfLines={1} style={styles.timestamp(colors)}>{new Date(n.createdAt).toLocaleString()}</Text>
      </Pressable>)}
      {data && !notices.length && <Text style={styles.empty(colors)}>{section === 'transactions' ? 'No unread transaction notifications.' : 'No unread messages.'}</Text>}
      {!!error && !selected && <Text accessibilityRole="alert" style={st.error}>{error}</Text>}
    </ScrollView>
    <View style={styles.pagination}>
      {page > 0 ? <Button label="Previous" disabled={q.isFetching} onPress={() => setPage(p => p - 1)} /> : <View />}
      {data?.hasNext && <Button label="Next" disabled={q.isFetching} onPress={() => setPage(p => p + 1)} />}
    </View>
    <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
      <View style={styles.modalBackdrop}>
        <View accessibilityViewIsModal style={styles.modalPanel(colors)}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={typography.card}>{selected?.title}</Text>
            <Text style={typography.body}>{selected?.message}</Text>
            {!!selected?.transactionId && <Button label="Transaction details" onPress={() => {
              const id = selected.transactionId!;
              setSelected(null);
              router.push({ pathname: '/receipt', params: { id } });
            }} />}
            <Button label={state.isLoading ? 'Updating...' : 'Mark as read'} disabled={state.isLoading} onPress={() => { if (selected) void markRead(selected); }} />
            {!!error && <Text accessibilityRole="alert" style={st.error}>{error}</Text>}
            <Button label="Close" onPress={() => setSelected(null)} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  </>;
}
