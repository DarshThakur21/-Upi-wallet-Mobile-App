import { styles } from './BottomNav.styles';
import { useTheme } from '../../theme/ThemeProvider';
import { Text } from '../Text';
import { Pressable, View } from 'react-native';
import { router, usePathname } from 'expo-router';

export function BottomNav() {
  const { colors } = useTheme();
  const path = usePathname();
  const items = [
    { label: 'Wallet', icon: '⌂', route: '/wallets' },
    { label: 'Activity', icon: '≡', route: '/activity' },
    { label: 'Transfer', icon: '+', route: '/payment' },
    { label: 'Inbox', icon: '○', route: '/inbox' },
    { label: 'Profile', icon: '●', route: '/profile' },
  ] as const;
  return <View style={styles.bar(colors)}>
    {items.map(item => <Pressable key={item.route} accessibilityRole="button" accessibilityLabel={item.label}
      accessibilityState={{ selected: path === item.route }} onPress={() => router.navigate(item.route)}
      style={styles.item}>
      <View style={styles.iconContainer(colors, item)}>
        <Text style={styles.icon(colors, item)}>{item.icon}</Text>
      </View>
      <Text style={styles.label(colors, item, path)}>{item.label}</Text>
    </Pressable>)}
  </View>;
}
