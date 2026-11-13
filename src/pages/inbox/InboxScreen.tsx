import { InboxPage } from './InboxPage';
import { styles } from './InboxScreen.styles';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../components/Text';
import { useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { BottomNav } from '../../components/navigation/BottomNav';
import { typography } from '../../theme/tokens';
import { inboxPageSize, type InboxSection } from './pagination';

export default function Inbox() {
  const { colors } = useTheme();
  const [section, setSection] = useState<InboxSection>('transactions');
  const { fontScale } = useWindowDimensions();
  const [height, setHeight] = useState(0);
  const rowHeight = Math.ceil(144 * Math.max(1, fontScale));
  const pageSize = inboxPageSize(height, rowHeight);
  return <SafeAreaView style={styles.page(colors)}>
    <View style={styles.header}>
      <Text accessibilityRole="header" style={typography.screen}>Inbox</Text>
      <View style={styles.tabs(colors)}>
        {(['transactions', 'messages'] as const).map(tab => <Pressable key={tab} accessibilityRole="tab"
          accessibilityState={{ selected: section === tab }} onPress={() => setSection(tab)}
          style={styles.tab(colors, section, tab)}>
          <SimpleLineIcons name={tab === 'transactions' ? 'credit-card' : 'envelope'} size={20} color={section === tab ? colors.inverse : colors.text} />
          <Text style={styles.tabLabel(colors, section, tab)}>{tab === 'transactions' ? 'Transactions' : 'Messages'}</Text>
        </Pressable>)}
      </View>
    </View>
    <View style={styles.body} onLayout={event => setHeight(Math.max(1, event.nativeEvent.layout.height - 64))}>
      {height > 0 && <InboxPage key={section + ':' + pageSize} section={section} pageSize={pageSize} rowHeight={rowHeight} />}
    </View>
    <BottomNav />
  </SafeAreaView>;
}

