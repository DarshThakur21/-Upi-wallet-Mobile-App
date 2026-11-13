import { styles } from './ProfileScreen.styles';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../../components/Text';
import type { PropsWithChildren } from 'react';
import { Pressable, View } from 'react-native';
import { Card } from '../../components/screen/Screen';

export function ProfileSection({ title, expanded, onPress, children }: PropsWithChildren<{
  title: string; expanded: boolean; onPress: () => void;
}>) {
  const { colors } = useTheme();
  return <Card>
    <Pressable accessibilityRole="button" accessibilityLabel={title}
      accessibilityState={{ expanded }} onPress={onPress}
      style={styles.sectionHeader}>
      <Text style={styles.sectionTitle(colors)}>{title}</Text>
      {/* <SimpleLineIcons name={expanded ? 'arrow-up' : 'arrow-down'} size={16} color={colors.muted} /> */}
    </Pressable>
    {expanded && <View style={styles.sectionBody}>{children}</View>}
  </Card>;
}

